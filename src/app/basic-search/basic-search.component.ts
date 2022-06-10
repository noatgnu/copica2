import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {WebService} from "../web.service";
import {DataFrame, fromCSV, IDataFrame, ISeries, Series} from "data-forge";
import {forkJoin} from "rxjs";
import {DataService} from "../data.service";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {BatchSearchComponent} from "../batch-search/batch-search.component";
import {ScrollService} from "../scroll.service";
import {RulerComponent} from "../ruler/ruler.component";
import {ProteomicRuler} from "../classes/proteomic-ruler";

@Component({
  selector: 'app-basic-search',
  templateUrl: './basic-search.component.html',
  styleUrls: ['./basic-search.component.scss']
})
export class BasicSearchComponent implements OnInit {
  get searchModel(): string {
    return this._searchModel;
  }

  set searchModel(value: string) {
    this._searchModel = value;
    this.searchFlag = this._searchModel.length > 2;
  }
  searchFlag: boolean = false
  private _searchModel: string = ""
  index: IDataFrame = new DataFrame()
  filterModel: string = ""
  @Output() search: EventEmitter<string[]> = new EventEmitter<string[]>()
  constructor(private scroll: ScrollService, private web: WebService, public data: DataService, private modal: NgbModal) {

  }

  ngOnInit(): void {
    this.web.getIndexText().subscribe(data => {
      if (data) {
        // @ts-ignore
        this.index = fromCSV(<string>data, {delimiter: "\t"})
        const work: any = {}
        const organismMap: any = {}
        for (const a of this.index) {
          work[a["File"]] = this.web.getData(a["File"])
          organismMap[a["File"]] = a["Organisms"]
        }
        forkJoin(work).subscribe((result:any) => {
          if (result) {
            let temp: ISeries[] = []
            for (const r in result) {
              // @ts-ignore
              const df = fromCSV(<string>result[r], {delimiter: "\t"})
              const series = df.getSeries("Gene names")
              temp.push(series)
              for (const row of df) {
                const g = row["Gene names"]
                if (!this.data.geneMap[g]) {
                  this.data.geneMap[g] = {}
                  this.data.accessionMap[g] = {}
                }

                this.data.accessionMap[g][row["Accession IDs"]] = organismMap[r]
                this.data.geneMap[g][r] = true
                for (const gn of g.split(";")) {
                  if (!this.data.geneMap[gn]) {
                    this.data.geneMap[gn] = this.data.geneMap[g]
                    this.data.accessionMap[gn] = this.data.accessionMap[g]
                  }
                }
              }
            }
            let dat = Series.concat(temp).bake()
            dat = dat.distinct().bake()
            this.data.allGenes = dat.toArray()
          }
        })
      }
    })
  }

  openBatch() {
    const ref = this.modal.open(BatchSearchComponent)
    ref.closed.subscribe(data => {
      this.handleSearch(data)
    })
  }

  handleSearch(data: any) {
    const result: string[] = []
    for (const g of this.data.allGenes) {
      for (const s of g.split(";")) {
        if (data.data[s]) {
          result.push(g)
          break
        }
      }
    }
    this.search.emit(result)
  }

  searchSingle() {
    this.search.emit([this._searchModel])
  }

  showChange(e: any) {
    console.log(e)
  }

  scrollTo() {
    const ind = this.data.selectedGenes.indexOf(this.filterModel)
    if (ind > -1) {
      const page = Math.floor(ind/this.data.pageSize)
      if (page+1 !== this.data.page) {
        console.log(page+1)
        this.data.page = page+1
      }
      this.scroll.scrollToID(this.filterModel)
    }
  }

  openRuler() {
    const ref = this.modal.open(RulerComponent, {size: "xl"})
    ref.componentInstance.copyNumber.subscribe((data: ProteomicRuler) => {
      if (data) {
        console.log(data)
      }
    })
  }
}

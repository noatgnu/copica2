import {Component, Input, OnInit} from '@angular/core';
import {DataService} from "../data.service";
import {WebService} from "../web.service";
import {DataFrame, fromCSV, IDataFrame} from "data-forge";

@Component({
  selector: 'app-protein',
  templateUrl: './protein.component.html',
  styleUrls: ['./protein.component.scss']
})
export class ProteinComponent implements OnInit {
  get selectedOrganism(): string {
    return this._selectedOrganism;
  }

  selectedPack: any = {}
  df: IDataFrame = new DataFrame()
  set selectedOrganism(value: string) {
    this._selectedOrganism = value;
    if (this._selectedOrganism !== "") {
      this.acc = this.accOrganismMap[this._selectedOrganism].ids
      this.selectedPack = {accs: this.acc, gene: this._name}
      const res: IDataFrame[] = []
      for (const d in this.data.geneMap[this._name]) {
        res.push(this.data.loadedData[d].where((r:any) => this.acc.includes(r["Accession IDs"])).bake())
      }
      this.df = DataFrame.concat(res).bake()
      this.getUniprot().then(r => {
        if (r) {

          // @ts-ignore
          const df = fromCSV(<string>r, {delimiter: "\t"})
          this.accOrganismMap[this._selectedOrganism].uniprot = df.first()
        }
      })
    }
  }
  _name = ""
  active = 2
  acc: string[] = []
  accOrganismMap: any = {}
  organismList: string[] = []
  Re = /([OPQ][0-9][A-Z0-9]{3}[0-9]|[A-NR-Z][0-9]([A-Z][A-Z0-9]{2}[0-9]){1,2})(-\d+)?/;
  private _selectedOrganism: string = ""
  @Input() set name(value: string) {
    this._name = value
    if (this._name) {
      for (const acc in this.data.accessionMap[this._name]) {
        if (!this.accOrganismMap[this.data.accessionMap[this._name][acc]]) {
          this.accOrganismMap[this.data.accessionMap[this._name][acc]] = {ids: [], uniprot: {}}
        }
        this.accOrganismMap[this.data.accessionMap[this._name][acc]].ids.push(acc)
      }
      for (const o in this.accOrganismMap) {

      }
      this.organismList = Object.keys(this.accOrganismMap)
      this.selectedOrganism = this.organismList[0]
    }
  }
  constructor(private data: DataService, private web: WebService) { }

  ngOnInit(): void {
  }

  async getUniprot() {
    for (const acc of this.acc) {
      for (const a of acc.split(";")) {
        const match = this.Re.exec(a)
        if (match) {
          try {
            const res = await this.web.getUniProtList([match[1]]).toPromise()
            if (res) {
              if (res.body !== "") {
                return res.body
              }
            }
          } catch (e) {
            console.log(e)
          }
        }
      }
    }
    return null
  }

  power10(n: number) {
    return Math.pow(10, n)
  }
}

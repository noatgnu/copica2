import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {InputFile} from "../classes/input-file";
import {DataService} from "../data.service";
import {ISeries, Series} from "data-forge";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {UniprotService} from "../uniprot.service";
import {ProteomicRuler} from "../classes/proteomic-ruler";
import {HistoneDb} from "../classes/histone-db";
import {WebService} from "../web.service";

@Component({
  selector: 'app-ruler',
  templateUrl: './ruler.component.html',
  styleUrls: ['./ruler.component.scss']
})
export class RulerComponent implements OnInit {
  columns: ISeries = new Series()
  @Output() copyNumber: EventEmitter<ProteomicRuler> = new EventEmitter<ProteomicRuler>()
  constructor(public data: DataService, private modal: NgbActiveModal, private uniprot: UniprotService, private web: WebService) { }

  ngOnInit(): void {
  }

  handleData(e: InputFile) {
    this.data.rulerFile = e
    this.columns = this.data.rulerFile.df.getColumns()
  }

  processRuler() {
    if (this.data.rulerFileForm.fetchUniProt) {
      const accs: string[] = []
      for (const r of this.data.rulerFile.df) {
        const accession = this.uniprot.Re.exec(r[this.data.rulerFileForm.accessionCol])
        if (accession) {
          this.uniprot.accMap.set(accession[1], r[this.data.rulerFileForm.accessionCol])
          this.uniprot.accMap.set(r[this.data.rulerFileForm.accessionCol], r[this.data.rulerFileForm.accessionCol])
          accs.push(accession[1])
        }
      }
      if (accs.length > 0) {
        this.uniprot.UniProtParseGet(accs, false).then(r => {
          this.addUniProtCol()
          this.columns = this.data.rulerFile.df.getColumns()
          this.data.rulerFileForm.geneNameCol = "UniProtGene"
          this.data.rulerFileForm.molecularCol = "UniProtMass"
          this.calculateCopyNumber();
        })
      }
    } else {
      this.calculateCopyNumber()
    }
  }

  private calculateCopyNumber() {
    const histoneDB = new HistoneDb(this.web)
    const copynumber = new ProteomicRuler(
      histoneDB,
      this.data.rulerFile.df,
      this.data.rulerFileForm.sampleCols,
      this.data.rulerFileForm.accessionCol,
      this.data.rulerFileForm.molecularCol,
      this.data.rulerFileForm.ploidy
    )
    this.copyNumber.emit(copynumber)
  }

  addUniProtCol() {
    const accs = this.data.rulerFile.df.getSeries(this.data.rulerFileForm.accessionCol)
    const mass = accs.map(value => {
      const uni = this.uniprot.getUniprotFromPrimary(value)
      if (uni) {
        return parseFloat(uni["Mass"].replace(",", ""))
      } else {
        return NaN
      }
    })
    const genes = accs.map(value => {
      const uni = this.uniprot.getUniprotFromPrimary(value)
      if (uni) {
        return uni["Gene names"]
      } else {
        return ""
      }
    })
    this.data.rulerFile.df = this.data.rulerFile.df.withSeries("UniProtMass", new Series(mass)).bake()
    this.data.rulerFile.df = this.data.rulerFile.df.withSeries("UniProtGene", new Series(genes)).bake()
  }
}

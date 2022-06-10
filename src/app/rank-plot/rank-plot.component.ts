import {Component, Input, OnInit} from '@angular/core';
import {DataFrame, IDataFrame} from "data-forge";
import {DataService} from "../data.service";

@Component({
  selector: 'app-rank-plot',
  templateUrl: './rank-plot.component.html',
  styleUrls: ['./rank-plot.component.scss']
})
export class RankPlotComponent implements OnInit {
  scatterPlotData: any[] = []
  scatterPlotLayout: any = {
    margin: {t:5, b: 25, l: 25, r: 100},
    width: 1000,
    xaxis: {
      title: "<b>Rank</b>",
    },
    yaxis: {
      title: "<b>log10(Copy number)</b>"
    },
    annotations: []
  }
  df: IDataFrame = new DataFrame()
  dataTracesMap: any = {}
  samples: string[] = []
  selectedDatasets: string[] = []
  @Input() set data(value: any) {
    if (value["accs"]) {
      const res: IDataFrame[] = []
      for (const d in this.dataService.geneMap[value.gene]) {
        res.push(this.dataService.loadedData[d].where((r:any) => value.accs.includes(r["Accession IDs"])).bake())
      }
      this.df = DataFrame.concat(res).bake()
      this.df = this.df.where(r => isFinite(r["Copy number"]) && (!isNaN(r["Rank"]))).bake()
      this.samples = this.df.getSeries("label").distinct().bake().toArray()
      this.selectedDatasets = [...this.samples]
      this.drawScatter();
    }
  }

  drawScatter() {
    const data: any[] = []
    for (const s of this.selectedDatasets) {
      data.push(Object.assign(this.dataService.scatterPlotTemplate[s]))
    }
    const annotations: any[] = []
    for (const row of this.df) {
      if (this.selectedDatasets.includes(row["label"])) {
        const ann: any = {
          xref: 'x',
          yref: 'y',
          x: row["Rank"],
          y: row["Copy number"],
          text: "<b>" + row["Gene names"] + "</b>",
          showarrow: true,
          arrowhead: 0.2,
          font: {
            size: 10
          }
        }
        annotations.push(ann)
      }
    }
    this.scatterPlotLayout.annotations = annotations
    this.scatterPlotData = data
  }

  constructor(private dataService: DataService) { }

  ngOnInit(): void {
  }

}

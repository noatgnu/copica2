import {Component, Input, OnInit} from '@angular/core';
import {DataService} from "../data.service";
import {DataFrame, IDataFrame, Series} from "data-forge";
import {tick} from "@angular/core/testing";

@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.scss']
})
export class BarChartComponent implements OnInit {
  barGraphData: any[] = []
  barGraphLayout: any = {
    width: 1300,
    height: 800,
    margin: {t: 25, b:300, l: 100, r: 25},
    xaxis: {
      "title" : "<b>Sample Categories</b>",
      "tickangle": 90,
      "type" : "category",
      "tickmode": "array",
      "tickvals": [],
      "tickfont": {
        "size": 17,
        "color": 'black'
      }
    },
    yaxis: {
      "title": "Copy number"
    }
  }
  df: IDataFrame = new DataFrame()
  @Input() set data(value: any) {
    if (value["accs"]) {
      this.barGraphData = []
      const res: IDataFrame[] = []
      for (const d in this.dataService.geneMap[value.gene]) {
        res.push(this.dataService.loadedData[d].where((r:any) => value.accs.includes(r["Accession IDs"])).bake())
      }
      this.df = DataFrame.concat(res).bake()
      const single = this.drawSingleShot()
      const fraction = this.drawFractionated()
      this.barGraphLayout.xaxis.tickvals = single.tickVals.concat(fraction.tickVals)
      this.barGraphLayout.xaxis.ticktext = this.barGraphLayout.xaxis.tickvals
      this.barGraphData = single.data.concat(fraction.data)
    }
  }
  constructor(private dataService: DataService) { }

  ngOnInit(): void {
  }

  drawSingleShot() {
    const barData: any[] = []
    const tickVals: string[] = []
    const df = this.df.where(r=> r["Experiment type"] === "Single shot").bake()
    for (const r of df) {
      barData.push({
        x: [r["Cell type"]],
        y: [Math.pow(10, r["Copy number"])],
        type: "bar",
        showlegend: false
      })
      tickVals.push(r["Cell type"])
    }
    return {data: barData, tickVals: tickVals}
  }

  drawFractionated() {
    const barData: any[] = []
    const tickVals: string[] = []
    const df = this.df.where(r=> r["Experiment type"] === "Fractionated").bake()
    const temp: any = {}
    for (const r of df) {
      const name = r["Cell type"] + "_" + r["Condition"]
      if (!temp[name]) {
        temp[name] = {
          x: name,
          y: [],
          type: "box",
          boxpoints: 'all',
          pointpos: 0,
          jitter: 0.3,
          fillcolor: 'rgba(255,255,255,0)',
          line: {
            color: 'rgba(255,255,255,0)',
          },
          hoveron: 'points',
          marker: {
            color: "#654949",
            opacity: 0.8,
          },
          name: name,
          showlegend: false
        }
      }
      temp[name].y.push(10^(r["Copy number"]))
    }
    for (const t in temp) {
      const s = new Series(temp[t].y)
      const std = s.std()
      const stdError = std/Math.sqrt(s.count())
      const mean = s.mean()
      barData.push(temp[t])
      barData.push({
        x: [t],
        y: [mean],
        error_y: {
          type: 'data',
          array: [stdError],
          visible: true
        },
        type: 'bar',
        name: t,
        showlegend: false
      })
      tickVals.push(t)
    }
    return {data: barData, tickVals: tickVals}
  }
}

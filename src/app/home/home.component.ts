import { Component, OnInit } from '@angular/core';
import {DataService} from "../data.service";
import {WebService} from "../web.service";
import {forkJoin} from "rxjs";
import {fromCSV, Series} from "data-forge";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  finished: boolean = false
  genes: string[] = []
  constructor(private data: DataService, private web: WebService) { }

  ngOnInit(): void {
  }

  handleSearch(searchData: string[]) {
    const selectedFiles: any = {}
    const loadedData: any = {}
    const scatterTemp: any = {}
    for (const d of searchData) {
      const files = Object.keys(this.data.geneMap[d])
      for (const f of files) {
        selectedFiles[<string>f] = this.web.getData(<string>f)
      }
    }

    forkJoin(selectedFiles).subscribe((data:any) => {
      if (data) {
        for (const d in data) {
          // @ts-ignore
          loadedData[d] = fromCSV(<string>data[d], {delimiter: "\t"})
          loadedData[d] = loadedData[d].withSeries("Copy number", new Series(this.data.convertToLogNumber(loadedData[d].getSeries("Copy number").toArray()))).bake()
          loadedData[d] = loadedData[d].withSeries("Rank", new Series(this.data.convertToNumber(loadedData[d].getSeries("Rank").toArray()))).bake()
          loadedData[d] = loadedData[d].where((r:any) => (!isNaN(r["Copy number"])) && (!isNaN(r["Rank"]))).bake()
          const first = loadedData[d].first()

          if (first["Experiment type"] === "Single shot") {
            scatterTemp[first["label"]] = {
              x: loadedData[d].getSeries("Rank").toArray(),
              y: loadedData[d].getSeries("Copy number").toArray(),
              text: loadedData[d].getSeries("Gene names").toArray(),
              marker: {
                size: 3
              },
              mode: "markers",
              type: "scattergl",
              name: first["label"]
            }
          } else {
            if (!scatterTemp[first["label"]]) {
              scatterTemp[first["label"]] = {
                x: [],
                y: [],
                text: loadedData[d].getSeries("Gene names").toArray(),
                marker: {
                  size: 3
                },
                mode: "markers",
                type: "scattergl",
                name: first["label"]
              }
            }
            scatterTemp[first["label"]].x = scatterTemp[first["label"]].x.concat(loadedData[d].getSeries("Rank").toArray())
            scatterTemp[first["label"]].y = scatterTemp[first["label"]].y.concat(loadedData[d].getSeries("Copy number").toArray())
            scatterTemp[first["label"]].text = scatterTemp[first["label"]].text.concat(loadedData[d].getSeries("Gene names").toArray())
          }
        }
        this.data.loadedData = loadedData
        this.data.scatterPlotTemplate = scatterTemp
      }
      this.genes = searchData.concat(this.genes)
      this.data.selectedGenes = this.genes.slice()
      this.finished = true
    })

  }
}

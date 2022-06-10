import { Injectable } from '@angular/core';
import {debounceTime, distinctUntilChanged, map, Observable, OperatorFunction} from "rxjs";
import {RulerFile} from "./classes/ruler-file";
import {InputFile} from "./classes/input-file";

@Injectable({
  providedIn: 'root'
})
export class DataService {
  allGenes: string[] = []
  geneMap: any = {}
  accessionMap: any = {}
  loadedData: any = {}
  scatterPlotTemplate: any = {}
  selectedGenes: string[] = []
  page: number = 1
  pageSize: number = 10
  rulerFileForm: RulerFile = new RulerFile()
  rulerFile: InputFile = new InputFile()
  constructor() { }

  searchFound: string[] = []

  search: OperatorFunction<string, readonly string[]> = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => term.length < 2 ? []
        : this.searchFilter(term))
    )

  searchFilter(term: string) {
    const res = this.allGenes.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0,10)
    if (res.length > 0) {
      this.searchFound = res
      return res
    }
    this.searchFound = []
    return []
  }

  convertToNumber(arr: string[]) {
    return arr.map(a => parseFloat(a))
  }
  convertToLogNumber(arr: string[]) {
    return arr.map(a => Math.log10(parseFloat(a)))
  }

  searchFilterLimited(term: string) {
    const res = this.selectedGenes.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0,10)
    if (res.length > 0) {
      return res
    }
    return []
  }

  searchLimited: OperatorFunction<string, readonly string[]> = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => term.length < 2 ? []
        : this.searchFilterLimited(term))
    )
}

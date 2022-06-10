import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import { HistoneItem } from './classes/histone-item';

@Injectable({
  providedIn: 'root'
})
export class WebService {

  constructor(private http: HttpClient) { }

  getIndexText() {
    return this.http.get("assets/dbs/index.txt", {observe: "body", responseType: "text"})
  }

  getData(fileName: string) {
    return this.http.get("assets/dbs/"+fileName, {observe: "body", responseType: "text"})
  }

  filters: any = {
    Kinases: {filename: "kinases.txt", name: "Kinases"},
    LRRK2: {filename: "lrrk2.txt", name: "LRRK2 Pathway"},
    Phosphatases: {filename: "phosphatases.txt", name: "Phosphatases"},
    PD: {filename: "pd.txt", name: "PD Genes (Mendelian)"},
    PINK1: {filename: "pink1.txt", name: "PINK1 Pathway"},
    PDGWAS: {filename: "pd.gwas.txt", name: "PD Genes (GWAS)"},
    DUBS: {filename: "dubs.txt", name: "Deubiquitylases (DUBs)"},
    E1_E2_E3Ligase: {filename: "e3ligase.txt", name: "E1, E2, E3 Ligases"},
    AD: {filename: "AD.txt", name: "AD Genes"},
    Mito: {filename: "Mito.txt", name: "Mitochondrial Proteins"},
    Golgi: {filename: "Golgi.txt", name: "Golgi Proteins"},
    Lysosome: {filename: "Lysosome.txt", name: "Lysosomal Proteins"},
    Glycosylation: {filename: "glyco.txt", name: "Glycosylation Proteins"},
    Metabolism: {filename: "metabolism.txt", name: "Metabolism Pathway"}
  }

  async getFilter(categoryName: string) {
    if (this.filters[categoryName]) {
      const res = await this.http.get("assets/proteinLists/" + this.filters[categoryName].filename, {observe: "body", responseType: "text"}).toPromise()
      if (res) {
        return res
      }
    }
    return ""
  }

  getUniProt(acc: string) {
    return this.http.get("https://rest.uniprot.org/uniprotkb/"+acc+".json", {observe:"response", responseType: "json", headers: {accept: "application/json"}})
  }
  toParamString(options: Map<string, string>): string {
    const pArray: string[] = [];
    options.forEach((value, key) => {
      pArray.push(encodeURI(key + '=' + value));
    });

    return pArray.join('&');
  }

  getUniProtList(accs: string[]) {
    const options: Map<string, string> = new Map<string, string>([
      ['from', 'ACC,ID'],
      ['to', 'ACC'],
      ['query', accs.join(' ')],
      ['format', 'tab'],
      ['columns', 'id,entry name,reviewed,protein names,genes,organism,length,database(RefSeq),organism-id,go-id,go(cellular component),comment(SUBCELLULAR LOCATION),feature(TOPOLOGICAL_DOMAIN),feature(GLYCOSYLATION),comment(MASS SPECTROMETRY),mass,sequence,database(STRING),feature(DOMAIN EXTENT),feature(MODIFIED RESIDUE),comment(FUNCTION)'],
      ['compress', 'no'],
      ['force', 'no'],
      ['sort', 'score'],
      ['desc', ''],
      ['fil', '']
    ]);
    return this.http.get("https://legacy.uniprot.org/uploadlists/?" + this.toParamString(options), {observe:"response", responseType: "text", headers: {accept: "application/text"}})
  }

  getOrganisms() : Observable<HistoneItem[]> {
    return this.http.get<HistoneItem[]>("assets/organisms.json", {observe: "body"})
  }
}

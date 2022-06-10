import { Component, OnInit } from '@angular/core';
import {WebService} from "../web.service";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-batch-search',
  templateUrl: './batch-search.component.html',
  styleUrls: ['./batch-search.component.scss']
})
export class BatchSearchComponent implements OnInit {
  data: string = ""
  title: string = ""
  constructor(public web: WebService, private modal: NgbActiveModal) {
    this.builtInList = Object.keys(this.web.filters)
  }

  ngOnInit(): void {
  }
  builtInList: string[] = []
  updateTextArea(categoryName: string) {
    this.web.getFilter(categoryName).then(r => {
      this.data = r
      this.title = this.web.filters[categoryName].name
    })
  }

  handleSubmit() {
    const result: any = {}
    for (const r of this.data.split("\n")) {
      const a = r.trim()
      if (a !== "") {
        const e = a.split(";")
        if (!result[a]) {
          result[a] = []
        }
        for (let f of e) {
          f = f.trim()
          result[a].push(f)
        }
      }
    }
    this.modal.close({data: result, title: this.title})
  }

  close() {
    this.modal.dismiss()
  }

}

import {Component, Input, OnInit} from '@angular/core';
import {DataService} from "../data.service";

@Component({
  selector: 'app-protein-viewer',
  templateUrl: './protein-viewer.component.html',
  styleUrls: ['./protein-viewer.component.scss']
})
export class ProteinViewerComponent implements OnInit {
  _genes: string[] = []
  collectionSize: number = 0
  @Input() set genes(value: string[]) {
    this.collectionSize = value.length
    this._genes = value
  }
  constructor(public data: DataService) { }

  ngOnInit(): void {
  }

}

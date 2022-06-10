import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {HttpClientModule} from "@angular/common/http";
import { BasicSearchComponent } from './basic-search/basic-search.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import {FormsModule} from "@angular/forms";
import { BatchSearchComponent } from './batch-search/batch-search.component';
import { HomeComponent } from './home/home.component';
import { ProteinViewerComponent } from './protein-viewer/protein-viewer.component';
import { ProteinComponent } from './protein/protein.component';

import * as PlotlyJS from 'plotly.js-dist-min';
import { PlotlyModule } from 'angular-plotly.js';
import { BarChartComponent } from './bar-chart/bar-chart.component';
import { RankPlotComponent } from './rank-plot/rank-plot.component';
import { RulerComponent } from './ruler/ruler.component';
import { FileInputWidgetComponent } from './file-input-widget/file-input-widget.component';

PlotlyModule.plotlyjs = PlotlyJS;
@NgModule({
  declarations: [
    AppComponent,
    BasicSearchComponent,
    BatchSearchComponent,
    HomeComponent,
    ProteinViewerComponent,
    ProteinComponent,
    BarChartComponent,
    RankPlotComponent,
    RulerComponent,
    FileInputWidgetComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    NgbModule,
    FormsModule,
    PlotlyModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

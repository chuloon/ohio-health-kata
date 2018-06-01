import { Component } from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Babysitter Kata';
  timeMask = [/[0-1]/, /[0-9]/, ':', /[0-5]/, /[0-9]/, ' ', /[a|A|p|P]/, /[m|M]/];
  startTime;
  bedTime;
  endTime;

  doCalculation = () => {
    const start = moment(this.startTime, 'h:m a');
    const bed = moment(this.bedTime, 'h:m a');
    const end = moment(this.endTime, 'h:m a');

    let current = start;
    
    while(!(moment(current).format('h:m a') === moment(end).format('h:m a'))) {
      current = moment(current).add(1, 'h');
      console.log(current.format('h:m a'));
    }
  }
}

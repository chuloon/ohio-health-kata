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

  bill = 0;
  showBill = false;

  timePlaceholder = "hh:mm am/pm"

  checkFieldsForCalculation = () => {
    if(this.startTime && this.endTime && this.bedTime) {
      let start = this.startTime.indexOf("_") === -1 ? true : false;
      let bed = this.bedTime.indexOf("_") === -1 ? true : false;
      let end = this.endTime.indexOf("_") === -1 ? true : false;

      if(start && bed && end) {
        this.doCalculation();
      }
    }
    else {
      this.showBill = false;
    }
  }

  doCalculation = () => {
    this.bill = 0;

    let start = moment(this.startTime, 'h:m a');
    if(start.isBefore(moment('4:00 pm', 'h:m a'))) {
      start = moment(start).add(1, 'd');
    }

    let bed = moment(this.bedTime, 'h:m a');
    if(bed.isBefore(moment('4:00 pm', 'h:m a'))) {
      bed = moment(bed).add(1, 'd');
    }

    let end = moment(this.endTime, 'h:m a');
    if(end.isBefore(moment('4:00 pm', 'h:m a'))) {
      end = moment(end).add(1, 'd');
    }

    const midnight = moment('11:59 pm', 'h:m a');

    let current = start;
    
    while(!(moment(current).format('h:m a') === moment(end).format('h:m a'))) {
      if(current.isSameOrAfter(midnight)) {
        this.bill += 16;
      }
      else if(current.isBefore(bed)) {
        this.bill += 12;
      }
      else if(current.isBefore(midnight) && current.isSameOrAfter(bed)) {
        this.bill += 8;
      }

      current = moment(current).add(1, 'h');
    }

    this.showBill = true;
  }
}

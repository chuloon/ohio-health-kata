import { Component, ViewContainerRef } from '@angular/core';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import * as moment from 'moment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Babysitter Kata';

  // This is the regex for the masks. Each character has to be its own object in the array, as per the package's requirements.
  timeMask = [/[0-1]/, /[0-9]/, ':', /[0-5]/, /[0-9]/, ' ', /[a|A|p|P]/, /[m|M]/];

  // Objects that act as the ngModel for each of the text fields.
  startTime: string;
  bedTime: string;
  endTime: string;

  bill = 0;
  showBill = false;

  timePlaceholder = "hh:mm am/pm";

  constructor(private toastr: ToastsManager, vRef: ViewContainerRef) {
    this.toastr.setRootViewContainerRef(vRef);
   }

  // This function is called every time the ngModel changes. I decided that it would be a cleaner experience for the user if 
  // I removed the submit button I had before. It saves them a click, and thus time. It also seemed unnecessary with such a
  // simple application if the app could just predict what the user was going to press anyway. 
  
  // I had considered making the function only fire when a user unfocused the field, but decided that would annoy or confuse
  // the user on the final field they filled out, as I would expect for it to fire once I completed the time I wanted to type.
  checkFieldsForCalculation = () => {
    // I'm first doing a check to see if all 3 are even partially filled out. I did this because checkFieldsForCalculation() 
    // is fired every single time a keypress in one of the fields is detected, and I didn't want to slow down the app
    // by making tons of function calls needlessly.
    if(this.startTime && this.endTime && this.bedTime) {
      let start = this.startTime.indexOf("_") === -1 ? true : false;
      let bed = this.bedTime.indexOf("_") === -1 ? true : false;
      let end = this.endTime.indexOf("_") === -1 ? true : false;

      // Once we verify that all three fields are completed (we don't have to check for field validity because of the text mask), fire off the calculation.
      if(start && bed && end) {
        this.doCalculation();
      }
    }
    // I put this else in so that if the user deletes one of the fields after filling it out, the bill won't show $0 before the calculation has all the required fields.
    else {
      this.showBill = false;
    }
  }

  doCalculation = () => {
    // Reset the bill to 0 in the case that the user wants to do more than one calculation per session
    this.bill = 0;

    // Initialize each of the variables (start, bed, and end) by making them be a moment object.
    // After that, I detect if the time input is beyond midnight, and if it is, add a day.

    // I did this because when I was adding an hour in the loop below that it was correctly
    // rolling it into the next hour, but wasn't adding a day as well, so I do that here instead.
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
    
    // Do not run the calculation if validation finds an error
    if(!this.doValidation(start, bed, end)) { return }

    // Set current to start so we're ready to loop through each hour.
    let current = start;
    
    // Loop through each of the hours (starting with the start time) and decide how much to bill for that hour.

    // My first thought was that I could do this without looping at all and handle it in constant time rather than linear
    // by looking at it as fractions of a bar. However, when I was making a cases I had to cover, I found that I would
    // have to make a bunch of different conditionals that would ultimately create confusing code that would be hard
    // to understand and read. This, of course, could create more bugs, and thus increase development time.
    // Because of this, I decided to go with something a little more straight forward and easier to debug, so in the future
    // of the application, a new developer could easily take the application and run with it.
    while(!(moment(current).format('h:m a') === moment(end).format('h:m a'))) {
      // Going with the highest priority (highest paid tier), we check if the current hour is midnight or after. If it is,
      // then the current bill rate for that hour is $16
      if(current.isSameOrAfter(midnight)) {
        this.bill += 16;
      }
      // If it's not after midnight, then check to see if the current hour is before bedtime. If it is, then bill $12
      else if(current.isBefore(bed)) {
        this.bill += 12;
      }
      // I really could have used a simple else for this, but I wanted to highlight the other billing case, which is
      // the time between midnight and bedtime. This case won't always be evoked in all calculations, since bedtime
      // can be after midnight.
      else if(current.isBefore(midnight) && current.isSameOrAfter(bed)) {
        this.bill += 8;
      }

      // Increment the current hour by one after all billing is completed for the current hour.
      current = moment(current).add(1, 'h');
    }

    // After everything is done calculating, show the bill to the user.
    // If you take a look at ngClass in the html file, you'll see that by setting showBill to true, that the class, 'show'
    // will be added to the element. In the scss file, I then change the opacity and transform to smoothly transition the final bill.
    this.showBill = true;
  }

  doValidation = (start:moment.Moment, bed:moment.Moment, end:moment.Moment): boolean => {
    let retVal = true;
    const earliestTime = moment("5:00 pm", 'h:m a');
    const latestTime = moment("4:00 am", 'h:m a').add(1, 'd');

    if(!this.doValidationByField("startTime", start, earliestTime, latestTime, "start")) retVal = false;
    if(!this.doValidationByField("bedTime", bed, earliestTime, latestTime, "bed")) retVal = false;
    if(!this.doValidationByField("endTime", end, earliestTime, latestTime, "end")) retVal = false;

    if(!this.checkTimeOrder(start, end)) retVal = false;

    return retVal;
  }

  doValidationByField = (globalTime, localTime, earliestTime, latestTime, timeLabel) => {
    let retVal = true;
    // If startTime is not null
    if(this[globalTime]) {
      // Then check if the startTime is invalid or not
      if(this[globalTime].indexOf("_") != -1) {
        // Throw an error if it is
        this.throwInvalidTimeError(timeLabel);
        retVal = false;
      }
      else {
        // Check the start time to see if it's between 5pm and 4am
        if(!(localTime.isBetween(earliestTime, latestTime) || localTime.isSame(earliestTime) || localTime.isSame(latestTime))) {
          // Throw an error if it's not
          this.throwTimeRangeError(timeLabel);
          retVal = false;
        }
        else {
          // If it is within the proper range, ensure no error is set
          this.setFieldError(timeLabel, false);
        }
      }
    }

    return retVal;
  }

  checkTimeOrder = (start: moment.Moment, end: moment.Moment) => {
    if(end.isBefore(start)) {
      this.toastr.error("Start time must be before end time");
      this.setFieldError("start", true);
      this.setFieldError("end", true);

      return false;
    }

    return true;
  }

  throwTimeRangeError = (field: string) => {
    this.toastr.error(field + " time must be between 5pm and 4am");
    this.setFieldError(field, true);
  }

  throwInvalidTimeError = (field: string) => {
    this.toastr.error("You must provide a valid " + field + " time");
    this.setFieldError(field, true);
  }

  setFieldError = (field: string, isInvalid: boolean) => {
    if(isInvalid) {
      document.getElementById(field).classList.add("invalid");
    }
    else {
      document.getElementById(field).classList.remove("invalid");
    }
  }
}
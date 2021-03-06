import { classNames, select, settings, templates } from '../settings.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';
import utils from '../utils.js';

class Booking {
  constructor(bookingWidgetElement) {
    const thisBooking = this;

    thisBooking.render(bookingWidgetElement);
    thisBooking.initWidgets();
    thisBooking.getData();
    // ex. 10.3
    thisBooking.tableSelectedData = '';
  }

  getData() {
    const thisBooking = this;

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePickerWidget.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePickerWidget.maxDate);

    const params = {
      booking: [
        startDateParam,
        endDateParam
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam
      ]
    };

    // console.log('getData params:', params);

    const urls = {
      booking: settings.db.url + '/' + settings.db.bookings + '?' + params.booking.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.events + '?' + params.eventsCurrent.join('&'),
      eventsRepeat: settings.db.url + '/' + settings.db.events + '?' + params.eventsRepeat.join('&'),
    };

    //console.log('getData urls:', urls);

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function (allResponses) {
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json()
        ]);
      })
      .then(function ([bookings, eventsCurrent, eventsRepeat]) {
        //console.log('bookings:', bookings, 'eventsCurrent:', eventsCurrent, 'eventsRepeat:', eventsRepeat);
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat) {
    const thisBooking = this;

    thisBooking.booked = {};

    for (let item of bookings) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for (let item of eventsCurrent) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePickerWidget.minDate;
    const maxDate = thisBooking.datePickerWidget.maxDate;

    for (let item of eventsRepeat) {
      if (item.repeat == 'daily') {
        for (let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)) {
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }

    //console.log(thisBooking.booked);

    thisBooking.updateDOM();
  }

  makeBooked(date, hour, duration, table) {
    const thisBooking = this;

    if (typeof thisBooking.booked[date] == 'undefined') {
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for (let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5) {
      //console.log('loop', hourBlock);

      if (typeof thisBooking.booked[date][hourBlock] == 'undefined') {
        thisBooking.booked[date][hourBlock] = [];
      }

      thisBooking.booked[date][hourBlock].push(table);
    }
  }

  updateDOM() {
    const thisBooking = this;

    thisBooking.date = thisBooking.datePickerWidget.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPickerWidget.value);

    let allAvailable = false;

    if (
      typeof thisBooking.booked[thisBooking.date] == 'undefined'
      ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
    ) {
      allAvailable = true;
    }

    for (let table of thisBooking.dom.tables) {
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if (!isNaN(tableId)) {
        tableId = parseInt(tableId);
      }
      if (
        !allAvailable
        &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ) {
        table.classList.add(classNames.booking.tableBooked);
        table.classList.remove(classNames.booking.tableSelected);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
  }

  sendBooking() {
    const thisBooking = this;


    // ENDPOINT ADRESS http://localhost:3131/bookings
    const url = settings.db.url + '/' + settings.db.bookings;

    const bookingLoad = {
      date: thisBooking.dom.datePicker.value,
      hour: thisBooking.dom.hourPicker.value,
      table: parseInt(thisBooking.tableSelectedData),
      duration: thisBooking.hoursAmountWidget.value,
      ppl: thisBooking.peopleAmountWidget.value,
      starters: {},
      phone: thisBooking.dom.phone.value,
      address: thisBooking.dom.address.value,
    };



    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingLoad),
    };

    fetch(url, options)
      .then(function (response) {
        return response.json();
      }).then(function (parsedResponse) {
        //console.log('parsedResponse', parsedResponse);

        thisBooking.booked = parsedResponse;
        //console.log(thisBooking.booked);
      });
  }


  render(bookingWidgetElement) {
    const thisBooking = this;

    const generatedHTML = templates.bookingWidget();
    thisBooking.dom = {};
    thisBooking.dom.wrapper = bookingWidgetElement;
    thisBooking.dom.wrapper.innerHTML = generatedHTML;
    thisBooking.dom.peopleAmount = document.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = document.querySelector(select.booking.hoursAmount);
    thisBooking.dom.datePicker = document.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = document.querySelector(select.widgets.hourPicker.wrapper);
    thisBooking.dom.tables = document.querySelectorAll(select.booking.tables);
    thisBooking.dom.floorPlan = document.querySelector(select.booking.floorPlan);
    thisBooking.dom.bookingSubmit = document.querySelector(select.booking.submit);
    thisBooking.dom.phone = document.querySelector(select.booking.phone);
    thisBooking.dom.address = document.querySelector(select.booking.address);
    thisBooking.dom.startersCheckbox = document.querySelector(select.booking.startersCheckbox);
    thisBooking.dom.starters = [];



  }



  initWidgets() {
    const thisBooking = this;


    thisBooking.peopleAmountWidget = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmountWidget = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePickerWidget = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPickerWidget = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.dom.wrapper.addEventListener('updated', function () {
      thisBooking.updateDOM();
    });

    // ex 10.3

    thisBooking.dom.floorPlan.addEventListener('click', function (event) {

      event.preventDefault();

      const targetTable = event.target;

      const clickedTableId = targetTable.getAttribute('data-table');

      if (!targetTable.classList.contains(classNames.booking.tableBooked) && !targetTable.classList.contains(classNames.booking.tableSelected)) {

        for (let table of thisBooking.dom.tables) {
          table.classList.remove(classNames.booking.tableSelected);
        }

        targetTable.classList.add(classNames.booking.tableSelected);

        thisBooking.tableSelectedData = clickedTableId;

      } else if (!targetTable.classList.contains(classNames.booking.tableBooked) && targetTable.classList.contains(classNames.booking.tableSelected)) {

        targetTable.classList.remove(classNames.booking.tableSelected);

      } else {

        alert('This table is unavaible');

      }

    });

    thisBooking.dom.startersCheckbox.addEventListener('click', function (event) {
      //event.preventDefault();

      const clickedCheckbox = event.target;

      if (clickedCheckbox.type === 'checkbox' && clickedCheckbox.name === 'starter') {
        //console.log('clickedCheckbox:', clickedCheckbox.value);


        if (clickedCheckbox.checked) {
          // add starters checkbox value to starters array
          thisBooking.dom.starters.push(clickedCheckbox.value);

        } else {
          // find index of removing starters checkbox
          const bookingStarterIndex = thisBooking.dom.starters.indexOf(clickedCheckbox);
          // remove starters checkbox value from starters array
          thisBooking.dom.starters.splice(bookingStarterIndex, 1);
        }

        //console.log(thisBooking.dom.starters);
      }

    });

    thisBooking.dom.bookingSubmit.addEventListener('click', function (event) {
      event.preventDefault();

      thisBooking.sendBooking();
      alert('Congrats, your booking was succesful !');
    });
  }

  /*initTables() {
    const thisBooking = this;

    thisBooking.dom.tables.addEventListener('click', function (event) {
      event.preventDefault();

      const targetTable = event.target;

      const clickedTableId = targetTable.getAttribute('data-table');

      if (!targetTable.classList.contains('booked') && !targetTable.classList.contains('selected')) {

        for (let table of thisBooking.dom.tables) {
          table.classList.remove('selected');
        }
        targetTable.classList.add('selected');

        thisBooking.tableSelectedData = clickedTableId;
      } else if (!targetTable.classList.contains('booked') && targetTable.classList.contains('selected')) {
        targetTable.classList.remove('selected');
      } else {
        alert('This table is unavaible');
      }
    });
  }*/
}


export default Booking;

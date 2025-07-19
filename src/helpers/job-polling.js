const { Subject, interval, TimeoutError, throwError } = require("rxjs");
const {
  catchError,
  exhaustMap,
  first,
  startWith,
  timeout
} = require("rxjs/operators");

const axios = require("axios").default;

const OPTIONS_DEFAULT = {
  interval: 1000 * 2,
  timeout: 1000 * 60 * 1 // changed from 60 to 80 for qoo10 sync
};

class GlobalService {
  constructor() {
    this.pollingEvent = new Subject();
    this.pollingEventObservable = this.pollingEvent.asObservable();
    this.pollingTime = 1000 * 1;
    this.autoPolling = this.pollingTime;
    this.isPollingTrue = false;
    this.pollingStatus = {
      message: "Please wait we are retrieving the data.",
      status: "polling",
      show: true,
      header: "",
      id: ""
    };

    this.POLLING_MESSAGES = {
      GET_DATA: {
        POLLING: "Please wait while we fetch the data.",
        SUCCESS: "Data fetched successfully."
      },
      UPDATE: {
        POLLING: "Please wait while we update the data.",
        SUCCESS: "Data updated successfully."
      },
      SAVE_DATA: {
        POLLING: "Please wait while we save the data.",
        SUCCESS: "Data saved successfully."
      },
      PDF_UPLOAD: {
        POLLING: "Please wait while we upload the data.",
        SUCCESS: "Data uploaded successfully."
      },
      EXPORT: {
        POLLING: "Please wait while we export the data.",
        SUCCESS: "Data exported successfully. Initiating Download"
      },
      IMPORT: {
        POLLING: "Please wait while we import the data.",
        SUCCESS: "Data imported successfully."
      },
      EXPAND_DOMAIN_OBJECT: {
        POLLING: "Please wait while we Expand Domain Object.",
        SUCCESS: "Expanded Domain Object successfully."
      },
      DELETE: {
        POLLING: "Please wait while we delete the data.",
        SUCCESS: "Data deleted successfully."
      },
      DISCOVER_DOMAIN_OBJECT: {
        POLLING: "Please wait while we discover Domain Object.",
        SUCCESS: "Discovered Domain Object successfully."
      },
      TEST: {
        POLLING: "Please wait while we test the data.",
        SUCCESS: "Data tested successfully."
      }
    };
  }

  setAccessoken(token) {
    axios.defaults.headers["Authorization"] = `Bearer ${token}`;
  }

  getJobStatus(id) {
    return axios.get(`/job/${id}`)
      .then((response) => response)
      .catch((error) => error?.response || error);
  }

  randomGenerator() {
    return "a" + Math.floor(1000 + Math.random() * 9000) + "z";
  }

  startPoll(header, randomId, pollFn, stopPollPredicate, msgObj, options = OPTIONS_DEFAULT) {
    return interval(options.interval).pipe(
      startWith(0),
      exhaustMap(() => {
        let pollingStatus = {};
        pollingStatus["id"] = randomId;
        pollingStatus["header"] = header;
        pollingStatus["message"] = msgObj?.POLLING || "Please wait while we fetch the data.";
        pollingStatus["status"] = "polling";
        pollingStatus["show"] = false;
        this.pollingEvent.next(pollingStatus);
        return pollFn();
      }),
      first((fValue) => {
        const value = fValue?.data || "";
        var isprocessed = value.process_status === "processed";
        let pollingStatus = {};
        pollingStatus["id"] = randomId;
        pollingStatus["header"] = header;
        if (isprocessed) {
          if (value?.result?.metadata) {
            pollingStatus["message"] = "Output is :" + JSON.stringify(value?.status?.message);
            pollingStatus["status"] = "success";
            pollingStatus["show"] = true;
            this.pollingEvent.next(pollingStatus);
            return stopPollPredicate(isprocessed);
          }
          pollingStatus["message"] = msgObj?.SUCCESS || "Success";
          pollingStatus["status"] = "success";
          pollingStatus["show"] = true;
          this.pollingEvent.next(pollingStatus);
          return stopPollPredicate(isprocessed);
        } else {
          pollingStatus["message"] = msgObj?.POLLING || `Polling in progress...`;
          pollingStatus["status"] = "polling";
          pollingStatus["show"] = false;
          this.pollingEvent.next(pollingStatus);
          return stopPollPredicate(isprocessed);
        }
      }),
      timeout(options.timeout),
      catchError((error) => {
        let pollingStatus = {};
        pollingStatus["id"] = randomId;
        pollingStatus["header"] = header;
        pollingStatus["show"] = true;
        if (error instanceof TimeoutError) {
          pollingStatus["status"] = "timeout";
          pollingStatus["message"] = "Time Out";
          this.pollingEvent.next(pollingStatus);
          return throwError(() => "TIME_OUT");
        }
        if (error?.error?.status?.message) {
          let objkeys = Object.keys(error.error?.status?.message);
          if (objkeys.length > 0) {
            pollingStatus["status"] = "exception";
            pollingStatus["message"] = JSON.stringify(error?.error?.status?.message);
            this.pollingEvent.next(pollingStatus);
            return throwError(() => error?.error?.status?.message);
          }
        }
        pollingStatus["status"] = "exception";
        pollingStatus["message"] = "Exception";
        this.pollingEvent.next(pollingStatus);
        return throwError(() => error);
      })
    );
  }
}

module.exports = new GlobalService();

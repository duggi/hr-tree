/*
 * Sugar
 */

const getElId = document.getElementById.bind(document);
const c = console.log.bind(window);


/*
 * Util
 */

class Util {
  // trims and converts a string to dash separated a-z 0-9
  static dasherize(str) {
    let val = str.toLowerCase();
    val = val.replace(/[^a-z0-9 ]/gi, '');    // strip non-alphanumeric
    val = val.replace(/\s\s+/g, ' ').trim();  // compress spaces and trim
    val = val.replace(/\s+/g, '-');           // replace spaces with dash
    return val;
  }

  // overloaded, returns a time or logs a timing
  static timing(...args) {
    const time = new Date().getTime();
    if (args.length > 0) {
      const start = args[0];    // first optional arg is a Date
      const message = args[1];  // second optional arg is a message
      const end = time;
      c(message, 'start:', start, 'end:', end, (end - start), 'ms');
      return;
    }
    return time;
  }

  // dom element from template string
  static makeEl(templateString, mimeType = "text/html") {
    return (new DOMParser)
      .parseFromString(templateString, mimeType)
      .body
      .firstElementChild;
  }

  // log and return, useful for debugging
  static logRet(message, obj) {
    c(message, obj);
    return null;
  }

  // uniquify array of hashes by keyname
  static uniqueVals(arr, key) {
    const vals = arr.map(a => a[key]);
    return [...new Set(vals)];
  }
}


/*
 * Employee
 * - constructor takes dasherized name slug
 */

class Employee {
  constructor(pid) {
    this.record = EMPLOYEES.find(emp => emp.pid === pid)
    if (!this.record) return null
    const r = this.record
    this.pid = r.pid
    this.mid = r.mid
    this.slug = r.slug
    this.displayName = r.displayName
    this.jobTitle = r.jobTitle
    this.unitSlug = r.unitSlug
    this.unitDisplayName = r.unitDisplayName
    this.city = r.city
    this.state = r.state
    this.email = r.email
    this.reports = r.reports
  }

  getManagers = () => {
    if (!this.mid.trim()) {
      return Util.logRet('getManagers: no managers', this.record);
    }
    const managers = EMPLOYEES.filter((emp) => {
      if (emp.pid.trim() || this.mid.trim() !== '') {
        return emp.pid === this.mid;
      }
    });
    let result = [];
    managers.forEach((mgr) => {
      result.push(new Employee(mgr.pid));
    });
    return result;
  }

  getStaffs = () => {
    const staffs = EMPLOYEES.filter(emp => this.pid === emp.mid)
    let result = [];
    staffs.forEach((staff) => {
      result.push(new Employee(staff.pid));
    });
    return result;
  }

  // renders EMPLOYEE node recursively
  renderNodeTree = (node = this, childEl) => {
    let nodeEl = this.makeNodeEl(node);
    if (node === this) {
      nodeEl = this.makeNodeEl(node, "node employee-node");
      getElId('console-body').append(nodeEl);
    }
    else childEl.append(nodeEl);

    if (node.reports.length === 0) return;
    node.reports.forEach((report) => {
      const reportEl = this.makeNodeEl(report);
      if (node.pid === report.pid) reportEl.append(nodeEl);
      this.renderNodeTree(report, nodeEl);
    })
  }

  makeNodeEl = (node, cssClass = "node") => {
    const markup = `
      <div class="${cssClass}" id="${'tree-' + node.pid}">
        <a href="hr-tree.html?p=${node.pid}">
          <div class="inner">
            <span class="name">${node.displayName}</span>
            <small>${node.jobTitle}</small>
          </div>
        </a>
      </div>
    `
    return Util.makeEl(markup);
  }
}


/*
 * Page
 * - initialize
 * - render managers
 * - render employee
 * - render staffs
 */

// expose global "constants" ¯\_(ツ)_/¯
let EMPLOYEES;
let EMPLOYEE;

const START = Util.timing();
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const p = urlParams.get('p'); // slug

const Page = ({
  init: function(employees) {
    EMPLOYEES = this.constructEmployees(employees);
    EMPLOYEES = this.addReports(EMPLOYEES);
    Util.timing(START, 'add reports');

    // person query string check
    if (!p) return this.coldStart('No person');

    // employee validation check
    EMPLOYEE = new Employee(p);
    if (!EMPLOYEE.record) return this.coldStart('Employee not found');

    const managers = EMPLOYEE.getManagers();
    const staffs = EMPLOYEE.getStaffs();
    this.renderManagers(managers);
    this.renderEmployee();
    this.renderStaffs(staffs);
    this.instrumentPage();
    Util.timing(START, 'finish page init');
  },

  constructEmployees: function(employees) {
    const restructure = (emp) => {
      // dasherize keys
      const pid         = Util.dasherize(emp["Position ID"]);
      const mid         = Util.dasherize(emp["Reports To Position ID"]);
      const slug        = Util.dasherize(emp["HR First Name Lower Case"]
                          + ' '
                          + emp["HR Last Name Lower Case"]);
      const unitSlug    = Util.dasherize(emp["HR Company Code Division"]);
      const fname       = emp["Preferred First Name"]
                          ? emp["Preferred First Name"]
                          : emp["HR First Name Lower Case"];
      const lname       = emp["Preferred Last Name"]
                          ? emp["Preferred Last Name"]
                          : emp["HR Last Name Lower Case"];
      const displayName = fname + ' ' + lname;
      const reports     = []

      // destructure to js conforming key names
      const {
        "HR First Name Lower Case": firstName,
        "HR Last Name Lower Case": lastName,
        "Job Title Description": jobTitle,
        "HR Company Code Division": unitDisplayName,
        "Work Contact: Work Email": email,
        ...zzz
      } = emp

      // construct result
      return {
        pid,
        mid,
        slug,
        firstName,
        lastName,
        displayName,
        jobTitle,
        unitSlug,
        unitDisplayName,
        email,
        reports
      }
    }
    return employees.map(restructure);
  },

  // invert "Reports To Position ID"
  addReports: function(employees) {
    let emps = employees;
    emps.forEach((emp) => {
      if (emp.mid === "") return;
      emps.forEach((mgr) => {
        if (emp.mid == mgr.pid) { mgr.reports.push(emp) }
      })
    })
    return emps;
  },

  renderManagers: function(managers) {
    if (!managers) return;
    managers.forEach((manager) => {
      let markup = '';
      markup += this.renderEmployeeCard(manager);
      getElId('managers-block').classList.remove('hide');
      getElId('managers-container').insertAdjacentHTML('beforeend', markup);
    });
    //c('renderManagers: done', managers);
  },

  renderEmployee: function() {
    const emailMarkup = `
      <a href="mailto:${EMPLOYEE.email}">${EMPLOYEE.email}</a>
    `
    const markup = `
    <div id="poi-block" class="block flex">
      <div class="poi-card">
        <h1 id="poi">${EMPLOYEE.displayName}</h1>
        <div id="console-toggle" class="console-toggle">
          <small class="tooltip">View org tree for ${EMPLOYEE.displayName}</small>
        </div>
        <p id="poi-job-title">${EMPLOYEE.jobTitle}</p>
        <small>${emailMarkup}</small>
      </div>
    </div>
    `
    getElId('employee-container').insertAdjacentHTML('beforeend', markup);
    //c('renderEmployee: done', EMPLOYEE);
  },

  renderStaffs: function(staffs) {
    if (!staffs) return;
    staffs.forEach((staff) => {
      markup = this.renderEmployeeCard(staff);
      getElId('reports-block').classList.remove('hide');
      getElId('reports-container').insertAdjacentHTML('beforeend', markup);
    });
  },

  renderEmployeeCard: function(employee) {
    return markup = `
      <div id="${employee.pid}">
        <a href="hr-tree.html?p=${employee.pid}" class="card">
          <div class="name">${employee.displayName}</div>
          <small>${employee.jobTitle}</small>
        </a>
      </div>
    `
  },

  coldStart: function(...stuff) {
    c(stuff);
    getElId('html').classList.add('cold-start-mode');
    //const random = Math.floor(Math.random() * EMPLOYEES.length);
    //const emp = EMPLOYEES[random];
    //const a = getElId('random-employee-link')
  },

  instrumentPage: function() {
    // click logo to go home
    const homeLogo = getElId("logo");
    homeLogo.addEventListener("click", () => {
      window.location.replace("hr-tree.html");
    })

    // don't instrument anything below if no employee
    if (!EMPLOYEE) return;

    // pre-render node tree
    EMPLOYEE.renderNodeTree()

    // toggle node tree console
    const htmlEl = getElId("html");
    const consoleToggle = getElId("console-toggle");
    const consoleClose = getElId("console-close");
    const modalCurtain = getElId("modal-curtain");
    [consoleToggle, consoleClose, modalCurtain].forEach(item => {
      item.addEventListener("click", () => {
        htmlEl.classList.toggle("console-hide");
      })
    })

    // add console title
    getElId("console-title").prepend(Util.makeEl(`
      <h2>Org Tree for ${EMPLOYEE.displayName}</h2>
      `
    ))
  }
})

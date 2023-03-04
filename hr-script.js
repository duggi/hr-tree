// sugar
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

  static businessUnitNames() {
    const bus = EMPLOYEES.map(e => e.unitDisplayName);
    c([...new Set(bus)]);
  }

  // uniquify array of hashes by keyname
  static uniqueVals(arr, key) {
    const vals = arr.map(a => a[key]);
    //c('values:', vals);
    return [...new Set(vals)];
  }

  // log and return, useful for debugging
  static logRet(message, obj) {
    c(message, obj);
    return null;
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
    if ( !this.mid.trim() ) return Util.logRet('getManagers: no managers', this.record);
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

  getAllStaffs = (node = this) => {
    if (node.reports.length === 0) return;
    if (node === this) {
      //this.print(node);
    }
    this.print(node);
    node.reports.forEach((r) => {
      c(`${r.displayName} ${r.pid} reports to ${node.displayName}`);
      this.print2(r, node);
      if (r.reports.length > 0) {
        this.getAllStaffs(r, node);
      }
    })
  }

  print = (node) => {
    const markup = `
      <hr>
      <div class="node" id="${node.pid}">${node.displayName}</div>
    `
    getElId('console').insertAdjacentHTML('beforeend', markup);
  }

  print2 = (node, pNode) => {
    const markup = `
      <div class="node" id="${node.pid}">> ${node.displayName}</div>
    `
    getElId('console').insertAdjacentHTML('beforeend', markup);
  }

  // Returns arrays of staff split by business `unitSlug`
  // If manager has reports across business units
  getStaffsByGroup = () => {
    const staffs = EMPLOYEES.filter(emp => this.pid === emp.mid)
    if (staffs.length < 1) return Util.logRet('getStaffsByGroup: no staff', staffs);
    let reduce = staffs.reduce((group, s) => {
      const { unitSlug } = s;
      group[unitSlug] = group[unitSlug] ?? [];
      group[unitSlug].push(new Employee(s.slug));
      return group;
    }, {});
    return Object.values(reduce);
  }
}


/*
 * Page
 * - initialize
 * - render managers
 * - render employee
 * - render staffs
 */

// constant-ish
let EMPLOYEES;
let EMPLOYEE;

const START = Util.timing();
const queryString = window.location.search;
const urlParams = new URLSearchParams( queryString );
const p = urlParams.get('p'); // slug

const Page = ({
  init: function(employees) {
    EMPLOYEES = this.constructEmployees(employees);
    EMPLOYEES = this.enhanceEmployees(EMPLOYEES);

    Util.timing(START, 'add reports');

    // person check
    if (!p) return this.coldStart('No person');

    // employee validation check
    EMPLOYEE = new Employee(p);
    if (!EMPLOYEE.record) return this.coldStart('Employee not found');

    const managers = EMPLOYEE.getManagers();
    //const staffGroups = EMPLOYEE.getStaffsByGroup();
    const staffs = EMPLOYEE.getStaffs();
    this.renderManagers(managers);
    this.renderEmployee();
    //this.renderStaffGroups(staffGroups);
    this.renderStaffs(staffs);
  },

  makeUrl: function() {
    // p: slug
  },

  constructEmployees: function(employees) {
    const restructure = (emp) => {
      // dasherize keys
      const pid = Util.dasherize(emp["Position ID"]);
      const mid = Util.dasherize(emp["Reports To Position ID"]);
      const slug = Util.dasherize(emp["HR First Name Lower Case"] + ' ' +  emp["HR Last Name Lower Case"]);
      const unitSlug = Util.dasherize(emp["HR Company Code Division"]);
      const fname = emp["Preferred First Name"] ?  emp["Preferred First Name"] : emp["HR First Name Lower Case"];
      const lname = emp["Preferred Last Name"] ?  emp["Preferred Last Name"] : emp["HR Last Name Lower Case"];
      const displayName = fname + ' ' + lname;
      const reports = []

      // destructure to js conforming key names
      const {
        "HR First Name Lower Case": firstName,
        "HR Last Name Lower Case": lastName,
        "Job Title Description": jobTitle,
        "HR Company Code Division": unitDisplayName,
        //"Primary Address: City": city,
        //"Primary Address: State / Territory Description": state,
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
        //city,
        //state,
        email,
        reports
        //zzz
      }
    }
    return employees.map(restructure);
  },

  enhanceEmployees: function(employees) {
    //let es = employees.filter(emp => emp.mid !== "")
    let es = employees;
    es.forEach((e) => {
      if (e.mid === "") return;
      es.forEach((m) => {
        if (e.mid == m.pid) { m.reports.push(e) }
      })
    })
    return es;
  },

  coldStart: function(...stuff) {
    c(stuff);
    getElId('html').classList.add('cold-start-mode');

    //const random = Math.floor(Math.random() * EMPLOYEES.length);
    //const emp = EMPLOYEES[random];
    //const a = getElId('random-employee-link')

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
        <p id="poi-job-title">${EMPLOYEE.jobTitle}</p>
        <small>${emailMarkup}</small>
      </div>
    </div>
    `
    getElId('employee-container').insertAdjacentHTML('beforeend', markup);
    //c('renderEmployee: done', EMPLOYEE);
  },

  //renderStaffGroups: function(staffGroups) {
  //  if (!staffGroups) return;
  //  staffGroups.forEach((staffs) => {
  //    let unitSlug = Util.uniqueVals(staffs, 'unitSlug')[0];
  //    let unitName = Util.uniqueVals(staffs, 'unitDisplayName')[0];
  //    let innerMarkup = '';
  //    let markup = '';
  //    staffs.forEach((employee) => {
  //      innerMarkup += this.renderEmployeeCard(employee);
  //    });
  //    markup = `
  //      <div class="show">
  //        <h2>${unitName}</h2>
  //        <div id="${unitSlug}" class="cards">
  //          ${innerMarkup}
  //        </div>
  //      </div>
  //    `
  //    getElId('reports-container').insertAdjacentHTML('beforeend', markup);
  //  });
  //  //c('renderStaffGroups: done', staffGroups);
  //},

  renderStaffs: function(staffs) {
    if (!staffs) return;
    staffs.forEach((staff) => {
      markup = this.renderEmployeeCard(staff);
      getElId('reports-block').classList.remove('hide');
      getElId('reports-container').insertAdjacentHTML('beforeend', markup);
    });
    //c('renderStaffGroups: done', staffGroups);
  },

  renderEmployeeCard: function(employee) {
    return markup = `
      <div id="${employee.pid}" class="card">
        <a href="hr-tree.html?p=${employee.pid}" class="name">
          ${employee.displayName}
        </a>
        <small>${employee.jobTitle}</small>
      </div>
    `
  }
})

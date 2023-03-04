const help = () => {
  const header = `
   ~~~~   _  _ ___     _____ ___ ___ ___   ~~~~
    ~~~  | || | _ \\   |_   _| _ | __| __|  ~~~
     ~~  | __ |   /     | | |   | _|| _|   ~~
      ~  |_||_|_|_\\     |_| |_|_|___|___|  ~

    ~~               HR Tree               ~~
    ~~    \`help()\` — print this manual     ~~


  `

  const body = `
"Ehpelsuw" is a fictional company with 2,609 employees. Their org chart is described by a directional graph, where \`Reports To Position ID\` points to the manager of a given employee.

For purposes of this demo, names have been obfuscated by \`_lib/jsonmask\`


----- REQUIREMENTS -----
· Must be fool-proof to use and share by non-technical business users
· Must be launchable into a browser
· Must not require anything other than native HTML and JavaScript
· Must be updatable with new data by non-technical HR team
· Must be searchable by employee name
· Must display employee's manager and any direct reports
· Must be traversable by clicking manager or reports
. Must be completed in a single work week timeline


----- DESIGN -----
· Written with flat HTML and native JavaScript ES6
. Not a SPA - request/response roundtrip with query string paramaters
· HTML file calls all dependencies within the same folder
· Updatable with new data by placing an Excel or csv file into a shared directory
  · If an Excel file is placed, it is converted to csv
  · Incremental data file must conform to column names
  · Csv data file is converted to json, then assigned to a JavaScript variable
· Main script contains three classes:
  1. Util       # static utility and convenience functions
  2. Employee   # instantiates employee objects from data file
  3. Page       # page controller
  `


  console.log(`%c${header} %c${body}`,
    "color: #ff0;", "color: #eee;");
}

help();

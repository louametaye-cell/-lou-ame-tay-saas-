const bcrypt = require('bcryptjs');
console.log(bcrypt.compareSync('Pass1234!', '$2b$10$a3CC/n.2Z6wohsid38p8w.2L52bmxWr3ni74GfHpsSCmxgMiU7Eaq'));

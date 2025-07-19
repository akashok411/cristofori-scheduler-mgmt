'use strict';

module.exports = {
  checkUser: `SELECT id "userId", first_name "firstName", last_name "lastName", email, phone, "password", salt, company_id "companyId" FROM staff where email ='@param1' and is_active = true;`,
  getCompanyInfo: `SELECT id, auth_metadata "authMetadata" FROM company where status = true and id=@param1;`,
};

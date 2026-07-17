/**
 * Creates a local admin user + org for signing in via /login (POST /api/v1/users/login).
 * Safe to re-run: skips creating the user if the email already exists, but always ensures
 * at least one department + position exist for that user's org (employee forms need them).
 *
 * Usage (from backend/):  npm run seed:dev   — or —   node scripts/seed-dev-admin.js
 * Optional env overrides:  DEV_ADMIN_EMAIL, DEV_ADMIN_PASSWORD
 */

const path = require("path");
require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
});

const bcrypt = require("bcryptjs");
const { MongoClient, ObjectId } = require("mongodb");
const { mongodbURI, dbName } = require("../src/config").db;
const getSlug = require("../src/utils/getSlug");

const EMAIL = process.env.DEV_ADMIN_EMAIL || "admin@essethr.local";
const PASSWORD = process.env.DEV_ADMIN_PASSWORD || "DevAdmin123!";
const EMPLOYEE_EMAIL = process.env.DEV_EMPLOYEE_EMAIL || "employee@essethr.local";
const EMPLOYEE_PASSWORD = process.env.DEV_EMPLOYEE_PASSWORD || "DevEmployee123!";

/** Minimal rows so HR screens (e.g. employee department/position selects) are usable. */
async function ensureBaselineDeptAndPositions(db, orgKey) {
  if (orgKey == null || orgKey === "") return;

  const orgStr = String(orgKey);
  const deptCount = await db.collection("departments").countDocuments({ org: orgStr });
  if (deptCount > 0) return;

  const deptRes = await db.collection("departments").insertOne({
    slug: "general",
    name: "General",
    org: orgStr,
    location: "HQ",
  });

  await db.collection("positions").insertOne({
    title: "Employee",
    slug: "employee",
    org: orgStr,
    department: deptRes.insertedId,
    level: "",
    manager: "",
    salary: 0,
    allowances: [],
    deductions: [],
  });
}

async function ensureDevEmployeeUser(db, orgKey) {
  if (orgKey == null || orgKey === "") return null;

  const orgStr = String(orgKey);
  const existingUser = await db.collection("users").findOne({ email: EMPLOYEE_EMAIL });
  if (existingUser?.employeeId) {
    return { skipped: true, email: EMPLOYEE_EMAIL, employeeId: existingUser.employeeId };
  }

  const dept = await db.collection("departments").findOne({ org: orgStr });
  const position = dept
    ? await db.collection("positions").findOne({ org: orgStr, department: dept._id })
    : null;

  let employeeId = existingUser?.employeeId;
  if (!employeeId) {
    const employeeDoc = {
      org: orgStr,
      firstName: "Dev",
      surName: "Employee",
      lastName: "User",
      gender: "Male",
      startDate: new Date().toISOString().slice(0, 10),
      status: "active",
      department: dept?._id ? String(dept._id) : "",
      position: position?._id ? String(position._id) : "",
      jobHistory: [
        {
          effectiveDate: new Date().toISOString().slice(0, 10),
          jobTitle: position?.title || "Employee",
          department: dept?.name || "General",
          location: "HQ",
        },
      ],
    };
    const empRes = await db.collection("employees").insertOne(employeeDoc);
    employeeId = empRes.insertedId;
  }

  const hash = await bcrypt.hash(EMPLOYEE_PASSWORD, 10);
  if (existingUser) {
    await db.collection("users").updateOne(
      { _id: existingUser._id },
      { $set: { employeeId: String(employeeId), role: "EMPLOYEE" } }
    );
  } else {
    await db.collection("users").insertOne({
      firstName: "Dev",
      lastName: "Employee",
      email: EMPLOYEE_EMAIL,
      password: hash,
      role: "EMPLOYEE",
      activated: true,
      phone: "+10000000002",
      org: orgStr,
      employeeId: String(employeeId),
    });
  }

  return { email: EMPLOYEE_EMAIL, password: EMPLOYEE_PASSWORD, employeeId: String(employeeId) };
}

async function ensureOrgBranchFields(db, orgId, createdByEmail) {
  const orgOid =
    orgId instanceof ObjectId ? orgId : new ObjectId(String(orgId));
  const org = await db.collection("orgs").findOne({ _id: orgOid });
  if (!org) return org;

  const slug = org.slug || getSlug(org.name);
  const updates = {};
  if (!org.companySlug) updates.companySlug = slug;
  if (!org.branch) updates.branch = "Main";
  if (org.isMainBranch === undefined) updates.isMainBranch = true;
  if (!org.createdBy && createdByEmail) updates.createdBy = createdByEmail;

  if (Object.keys(updates).length > 0) {
    await db.collection("orgs").updateOne({ _id: orgOid }, { $set: updates });
    return { ...org, ...updates };
  }
  return org;
}

async function ensureDemoBranches(db, mainOrgId, createdByEmail) {
  const mainOrg = await ensureOrgBranchFields(db, mainOrgId, createdByEmail);
  const companySlug = mainOrg.companySlug || mainOrg.slug || getSlug(mainOrg.name);

  const branchDefs = [
    {
      branch: "Bole Branch",
      phone: "+251911000101",
      address: { city: "Addis Ababa", region: "Addis Ababa", woreda: "Bole" },
    },
    {
      branch: "Hawassa Branch",
      phone: "+251911000102",
      address: { city: "Hawassa", region: "Sidama" },
    },
  ];

  const created = [];
  for (const def of branchDefs) {
    const slug = `${companySlug}-${getSlug(def.branch)}`;
    let branchOrg = await db.collection("orgs").findOne({ slug });
    if (!branchOrg) {
      const res = await db.collection("orgs").insertOne({
        slug,
        name: mainOrg.name,
        companySlug,
        branch: def.branch,
        isMainBranch: false,
        phone: def.phone,
        email: mainOrg.email,
        address: def.address,
        createdBy: createdByEmail,
      });
      branchOrg = await db.collection("orgs").findOne({ _id: res.insertedId });
    }
    await ensureBaselineDeptAndPositions(db, branchOrg._id);
    created.push(String(branchOrg._id));
  }
  return created;
}

async function main() {
  const client = new MongoClient(mongodbURI);
  await client.connect();
  const db = client.db(dbName);

  const existing = await db.collection("users").findOne({ email: EMAIL });

  if (existing) {
    const orgKey = existing.org;
    await ensureOrgBranchFields(db, orgKey, EMAIL);
    await ensureBaselineDeptAndPositions(db, orgKey);
    await ensureDemoBranches(db, orgKey, EMAIL);
    const employeeUser = await ensureDevEmployeeUser(db, orgKey);
    console.log(
      JSON.stringify(
        {
          ok: true,
          skipped: true,
          email: EMAIL,
          ensuredDeptPositions: Boolean(orgKey),
          employeeUser,
        },
        null,
        2
      )
    );
    await client.close();
    return;
  }

  const orgName = "Dev Organization";
  const orgSlug = getSlug(orgName);

  let orgId;
  const existingOrg = await db.collection("orgs").findOne({ slug: orgSlug });
  if (existingOrg) {
    orgId = existingOrg._id;
  } else {
    const orgDoc = {
      slug: orgSlug,
      name: orgName,
      companySlug: orgSlug,
      branch: "Main",
      isMainBranch: true,
      createdBy: EMAIL,
      phone: "+10000000000",
      email: "org@essethr.local",
      address: {
        city: "Addis Ababa",
        region: "Addis Ababa",
      },
    };
    const orgRes = await db.collection("orgs").insertOne(orgDoc);
    orgId = orgRes.insertedId;
  }

  await ensureBaselineDeptAndPositions(db, orgId);
  await ensureDemoBranches(db, orgId, EMAIL);

  const hash = await bcrypt.hash(PASSWORD, 10);
  const userDoc = {
    firstName: "Admin",
    lastName: "User",
    email: EMAIL,
    password: hash,
    role: "ADMIN",
    activated: true,
    phone: "+10000000001",
    org: String(orgId),
  };

  await db.collection("users").insertOne(userDoc);

  const employeeUser = await ensureDevEmployeeUser(db, orgId);

  console.log(
    JSON.stringify(
      {
        ok: true,
        created: true,
        loginUrl: "POST /api/v1/users/login",
        email: EMAIL,
        password: PASSWORD,
        employeeUser,
        hint: "Use these on the app login page at /login",
      },
      null,
      2
    )
  );

  await client.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

/**
 * Seeds demo data across all HR modules, scoped per branch.
 * Requires MongoDB + seed:dev (admin, branches). Clears prior demo rows on --force.
 *
 * Usage (from backend/):
 *   npm run seed:demo          — skip if already seeded
 *   npm run seed:demo:force    — wipe demo rows and re-seed all branches
 *   npm run seed:all           — admin + demo in one command
 */

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const bcrypt = require("bcryptjs");
const { MongoClient, ObjectId } = require("mongodb");
const { mongodbURI, dbName } = require("../src/config").db;
const getSlug = require("../src/utils/getSlug");

const SEED_KEY = "demo-v2-branches";
const PASSWORD_DEMO = process.env.DEV_DEMO_PASSWORD || "DemoPass123!";

const DEMO_USERS = [
  {
    email: "hr@essethr.local",
    firstName: "Helen",
    lastName: "HR",
    role: "HR_MANAGER",
    phone: "+251911000001",
  },
  {
    email: "supervisor@essethr.local",
    firstName: "Samuel",
    lastName: "Supervisor",
    role: "SUPERVISOR",
    phone: "+251911000002",
  },
];

/** Per-branch demo profiles — each branch gets its own org-scoped rows. */
const BRANCH_PROFILES = [
  {
    match: (org) => org.isMainBranch === true || String(org.branch || "").toLowerCase() === "main",
    code: "HQ",
    location: "Addis Ababa — HQ",
    departments: [
      { slug: "engineering", name: "Engineering", location: "HQ — Floor 2" },
      { slug: "human-resources", name: "Human Resources", location: "HQ — Floor 1" },
      { slug: "finance", name: "Finance", location: "HQ — Floor 1" },
    ],
    positions: [
      { title: "Software Engineer", slug: "software-engineer", dept: "engineering", salary: 45000 },
      { title: "QA Engineer", slug: "qa-engineer", dept: "engineering", salary: 38000 },
      { title: "HR Officer", slug: "hr-officer", dept: "human-resources", salary: 35000 },
      { title: "Accountant", slug: "accountant", dept: "finance", salary: 40000 },
    ],
    employees: [
      { id: "EMP-HQ-001", firstName: "Sara", surName: "Bekele", gender: "Female", dept: "engineering", pos: "software-engineer", status: "active" },
      { id: "EMP-HQ-002", firstName: "Abebe", surName: "Kebede", gender: "Male", dept: "engineering", pos: "qa-engineer", status: "active" },
      { id: "EMP-HQ-003", firstName: "Meron", surName: "Tadesse", gender: "Female", dept: "human-resources", pos: "hr-officer", status: "active" },
      { id: "EMP-HQ-004", firstName: "Michael", surName: "Assefa", gender: "Male", dept: "finance", pos: "accountant", status: "active" },
      { id: "EMP-HQ-005", firstName: "Yonas", surName: "Demissie", gender: "Male", dept: "engineering", pos: "software-engineer", status: "inactive" },
    ],
    announcements: [
      { title: "HQ All-hands", body: "Company-wide meeting at Main HQ this Friday." },
      { title: "Q2 Reviews", body: "Performance reviews open for HQ staff." },
    ],
    jobTitle: "Senior Software Engineer",
    jobDepartment: "Engineering",
  },
  {
    match: (org) => String(org.branch || "").toLowerCase().includes("bole"),
    code: "BOLE",
    location: "Addis Ababa — Bole",
    departments: [
      { slug: "sales", name: "Sales", location: "Bole — Ground floor" },
      { slug: "operations", name: "Operations", location: "Bole — Floor 1" },
    ],
    positions: [
      { title: "Sales Representative", slug: "sales-rep", dept: "sales", salary: 32000 },
      { title: "Operations Lead", slug: "ops-lead", dept: "operations", salary: 36000 },
    ],
    employees: [
      { id: "EMP-BOLE-001", firstName: "Liya", surName: "Mekonnen", gender: "Female", dept: "sales", pos: "sales-rep", status: "active" },
      { id: "EMP-BOLE-002", firstName: "Daniel", surName: "Haile", gender: "Male", dept: "sales", pos: "sales-rep", status: "active" },
      { id: "EMP-BOLE-003", firstName: "Hanna", surName: "Girma", gender: "Female", dept: "operations", pos: "ops-lead", status: "active" },
    ],
    announcements: [
      { title: "Bole branch opening hours", body: "New weekend shift schedule for Bole retail team." },
    ],
    jobTitle: "Sales Associate",
    jobDepartment: "Sales",
  },
  {
    match: (org) => String(org.branch || "").toLowerCase().includes("hawassa"),
    code: "HAW",
    location: "Hawassa",
    departments: [
      { slug: "regional-ops", name: "Regional Operations", location: "Hawassa office" },
      { slug: "customer-service", name: "Customer Service", location: "Hawassa office" },
    ],
    positions: [
      { title: "Regional Coordinator", slug: "regional-coordinator", dept: "regional-ops", salary: 34000 },
      { title: "Support Agent", slug: "support-agent", dept: "customer-service", salary: 28000 },
    ],
    employees: [
      { id: "EMP-HAW-001", firstName: "Robel", surName: "Tesfaye", gender: "Male", dept: "regional-ops", pos: "regional-coordinator", status: "active" },
      { id: "EMP-HAW-002", firstName: "Selam", surName: "Abera", gender: "Female", dept: "customer-service", pos: "support-agent", status: "active" },
    ],
    announcements: [
      { title: "Hawassa regional update", body: "Regional KPI targets for Sidama zone published." },
    ],
    jobTitle: "Regional Support Agent",
    jobDepartment: "Customer Service",
  },
];

function isoDate(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return isoDate(d);
}

function morningTs(dateStr, hour = 8, min = 30) {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setHours(hour, min, 0, 0);
  return d.getTime();
}

function profileForOrg(org) {
  return (
    BRANCH_PROFILES.find((p) => p.match(org)) ||
    BRANCH_PROFILES[0]
  );
}

async function getAdminContext(db) {
  const adminEmail = process.env.DEV_ADMIN_EMAIL || "admin@essethr.local";
  const admin = await db.collection("users").findOne({ email: adminEmail });
  if (!admin?.org) {
    throw new Error(`Admin user "${adminEmail}" not found. Run: npm run seed:dev`);
  }
  return { admin, homeOrgId: String(admin.org) };
}

async function getCompanyBranches(db, homeOrgId) {
  const home = await db.collection("orgs").findOne({
    _id: new ObjectId(String(homeOrgId)),
  });
  if (!home) throw new Error("Admin org not found.");

  const companySlug =
    home.companySlug || home.slug || getSlug(home.name || "company");

  const branches = await db
    .collection("orgs")
    .find({ companySlug })
    .sort({ isMainBranch: -1, branch: 1 })
    .toArray();

  return branches.length ? branches : [home];
}

async function clearDemoDataForBranches(db, branchOrgIds) {
  const orgStrings = branchOrgIds.map(String);
  const orgOids = branchOrgIds.map((id) => new ObjectId(String(id)));

  const orgFilter = { org: { $in: orgStrings } };
  const orgOidFilter = { org: { $in: orgOids } };
  const orgIdFilter = { orgId: { $in: orgStrings } };

  const demoEmployees = await db
    .collection("employees")
    .find({ demoSeed: true, org: { $in: orgStrings } })
    .project({ _id: 1 })
    .toArray();
  const demoEmpIds = demoEmployees.map((e) => e._id);

  if (demoEmpIds.length) {
    await db.collection("leaves").deleteMany({ employeeId: { $in: demoEmpIds } });
    await db.collection("leave_allowances").deleteMany({
      employeeId: { $in: demoEmpIds },
    });
  }

  await db.collection("leaves").deleteMany({
    $or: [{ demoSeed: true, ...orgFilter }, { demoSeed: true, ...orgOidFilter }],
  });

  const collections = [
    "announcements",
    "shift_templates",
    "shift_assignments",
    "workflow_templates",
    "approval_requests",
    "job_postings",
    "candidates",
    "onboarding_templates",
    "onboarding_instances",
    "performance_goals",
    "performance_reviews",
    "training_courses",
    "training_records",
    "documents",
    "attendances",
    "payrolls",
    "payslips",
    "audit_logs",
    "leave_types",
    "holidays",
    "departments",
    "positions",
    "org_settings",
  ];

  for (const name of collections) {
    await db.collection(name).deleteMany({
      $or: [{ demoSeed: true, ...orgFilter }, { demoSeed: true, ...orgIdFilter }],
    });
  }

  await db.collection("employees").deleteMany({
    demoSeed: true,
    org: { $in: orgStrings },
  });

  await db.collection("users").deleteMany({
    email: { $in: DEMO_USERS.map((u) => u.email) },
  });

  await db.collection("seed_meta").deleteMany({
    key: { $in: [SEED_KEY, "demo-v1"] },
  });
}

async function ensureDepartments(db, orgId, profile) {
  const out = [];
  for (const spec of profile.departments) {
    const res = await db.collection("departments").insertOne({
      ...spec,
      org: orgId,
      demoSeed: true,
    });
    out.push({ _id: res.insertedId, ...spec });
  }
  return out;
}

async function ensurePositions(db, orgId, departments, profile) {
  const deptMap = Object.fromEntries(departments.map((d) => [d.slug, d]));
  const out = [];
  for (const spec of profile.positions) {
    const dept = deptMap[spec.dept];
    const res = await db.collection("positions").insertOne({
      org: orgId,
      title: spec.title,
      slug: spec.slug,
      department: dept._id,
      level: "Mid",
      manager: "",
      salary: spec.salary,
      allowances: [],
      deductions: [],
      demoSeed: true,
    });
    out.push({ _id: res.insertedId, ...spec, department: dept._id });
  }
  return out;
}

async function seedEmployees(db, orgId, orgOid, departments, positions, profile) {
  const deptMap = Object.fromEntries(departments.map((d) => [d.slug, d]));
  const posMap = Object.fromEntries(positions.map((p) => [p.slug, p]));
  const employees = [];

  for (const spec of profile.employees) {
    const dept = deptMap[spec.dept];
    const pos = posMap[spec.pos];
    const startDate = daysAgo(120 + profile.code.length * 10);
    const salary = pos?.salary || 35000;
    const doc = {
      org: orgId,
      employeeId: spec.id,
      firstName: spec.firstName,
      surName: spec.surName,
      lastName: spec.surName,
      gender: spec.gender,
      phone: "+251911" + String(100000 + employees.length + profile.code.length * 11),
      email: `${spec.firstName.toLowerCase()}.${profile.code.toLowerCase()}@demo.essethr.local`,
      address: profile.location + ", Ethiopia",
      department: String(dept._id),
      position: String(pos._id),
      status: spec.status,
      startDate,
      hireDate: startDate,
      birthDay: "1990-03-20",
      salary,
      jobHistory: [
        {
          effectiveDate: startDate,
          jobTitle: pos.title,
          department: dept.name,
          location: profile.location,
          branch: profile.code,
        },
      ],
      customFieldValues: {
        tshirtSize: "M",
        emergencyContact: "+251900000000",
      },
      demoSeed: true,
    };
    const res = await db.collection("employees").insertOne(doc);
    employees.push({ _id: res.insertedId, ...doc });
  }
  return employees;
}

async function seedDemoUsers(db, mainOrgId, mainDepartments) {
  const hash = await bcrypt.hash(PASSWORD_DEMO, 10);
  const engDept = mainDepartments.find((d) => d.slug === "engineering");
  for (const u of DEMO_USERS) {
    await db.collection("users").insertOne({
      ...u,
      password: hash,
      activated: true,
      org: mainOrgId,
      departmentId:
        u.role === "SUPERVISOR" && engDept ? String(engDept._id) : undefined,
      demoSeed: true,
    });
  }
}

async function seedLeaveTypesAndHolidays(db, orgId, branchLabel) {
  const types = [
    { title: "annual", duration: "16", color: "#4caf50", allowDaysFromPast: false },
    { title: "sick", duration: "10", color: "#ff9800", allowDaysFromPast: true },
    { title: "special", duration: "3", color: "#2196f3", allowDaysFromPast: false },
  ];
  for (const t of types) {
    await db.collection("leave_types").insertOne({
      ...t,
      org: orgId,
      demoSeed: true,
    });
  }
  await db.collection("holidays").insertOne({
    org: orgId,
    title: `${branchLabel} — Public Holiday`,
    fromDate: daysAgo(-30),
    toDate: daysAgo(-28),
    length: 1,
    employees: [],
    demoSeed: true,
  });
}

async function seedLeaveAllowances(db, employees) {
  for (const emp of employees) {
    await db.collection("leave_allowances").insertOne({
      employeeId: emp._id,
      allocated: { annual: 16, sick: 10, special: 3, maternal: 60 },
      used: { annual: 1, sick: 0, special: 0, maternal: 0 },
      demoSeed: true,
    });
  }
}

async function seedLeaves(db, orgId, orgOid, employees) {
  if (!employees.length) return;
  const [e1, e2] = employees;
  const today = isoDate();

  if (e1) {
    await db.collection("leaves").insertOne({
      org: orgOid,
      employeeId: e1._id,
      leaveType: "annual",
      duration: 2,
      startDate: daysAgo(-5),
      endDate: daysAgo(-4),
      from: daysAgo(-5),
      to: daysAgo(-4),
      note: `Pending leave — ${orgId.slice(-4)}`,
      status: "pending",
      approved: false,
      demoSeed: true,
      createdOn: new Date(),
      lastModifiedOn: new Date(),
    });
  }

  if (e2) {
    await db.collection("leaves").insertOne({
      org: orgOid,
      employeeId: e2._id,
      leaveType: "sick",
      duration: 1,
      startDate: today,
      endDate: today,
      from: today,
      to: today,
      note: `Approved sick leave — branch demo`,
      status: "approved",
      approved: true,
      demoSeed: true,
      createdOn: new Date(),
      lastModifiedOn: new Date(),
    });
  }
}

async function seedAttendance(db, orgId, employees, profile) {
  const active = employees.filter((e) => e.status === "active");
  for (let day = 0; day < 7; day += 1) {
    const date = daysAgo(day);
    for (const emp of active) {
      const isLate = day === 1 && emp.employeeId?.endsWith("002");
      const checkin = morningTs(date, isLate ? 9 : 8, isLate ? 40 : 10);
      const checkout = checkin + 8 * 3600000;
      await db.collection("attendances").insertOne({
        orgId,
        employeeId: String(emp._id),
        date,
        checkin,
        checkout,
        workedHours: 8,
        overtimeHours: day === 0 ? 1 : 0,
        remark: isLate ? "late" : "on_time",
        status: day <= 2 ? "approved" : "pending",
        branchCode: profile.code,
        demoSeed: true,
      });
    }
  }
}

async function seedPayroll(db, orgId, employees, adminId, branchLabel) {
  const fromDate = daysAgo(30);
  const toDate = daysAgo(1);
  const payDate = isoDate();
  const active = employees.filter((e) => e.status === "active");
  const totalPayment = active.reduce((s, e) => s + (e.salary || 35000), 0);

  const payrollRes = await db.collection("payrolls").insertOne({
    org: orgId,
    title: `${branchLabel} — Monthly Payroll`,
    employeesCount: active.length,
    totalPayment,
    fromDate,
    toDate,
    payDate,
    frequency: "Monthly",
    payType: "Monthly",
    status: "pending",
    locked: false,
    demoSeed: true,
    createdOn: new Date(),
  });

  const payslips = active.map((emp) => ({
    org: orgId,
    employeeId: String(emp._id),
    payrollId: payrollRes.insertedId,
    payrollTitle: `${branchLabel} — Monthly Payroll`,
    fromDate,
    toDate,
    payDate,
    frequency: "Monthly",
    earningsTotal: emp.salary || 35000,
    deductionsTotal: Math.round((emp.salary || 35000) * 0.15),
    netPay: Math.round((emp.salary || 35000) * 0.85),
    netPayment: Math.round((emp.salary || 35000) * 0.85),
    status: "pending",
    demoSeed: true,
  }));
  if (payslips.length) await db.collection("payslips").insertMany(payslips);

  if (active.length) {
    await db.collection("payrolls").insertOne({
      org: orgId,
      title: `${branchLabel} — Finalized (prior month)`,
      employeesCount: active.length,
      totalPayment: Math.round(totalPayment * 0.95),
      fromDate: daysAgo(60),
      toDate: daysAgo(31),
      payDate: daysAgo(25),
      frequency: "Monthly",
      status: "finalized",
      locked: true,
      finalizedAt: new Date(daysAgo(20)),
      finalizedBy: String(adminId),
      demoSeed: true,
      createdOn: new Date(daysAgo(28)),
    });
  }

  return payrollRes;
}

async function seedPlatformModules(db, orgId, employees, adminId, profile) {
  const emp = employees[0];
  const empId = String(emp?._id || "");
  const branchLabel = profile.code;

  if (profile.announcements?.length) {
    await db.collection("announcements").insertMany(
      profile.announcements.map((a) => ({
        org: orgId,
        title: a.title,
        body: a.body,
        authorId: String(adminId),
        active: true,
        publishedOn: new Date(),
        demoSeed: true,
      }))
    );
  }

  const shiftTplRes = await db.collection("shift_templates").insertOne({
    org: orgId,
    name: `${branchLabel} Standard Day`,
    startTime: "08:00",
    endTime: "17:00",
    breakMinutes: 60,
    isOvernight: false,
    demoSeed: true,
    createdOn: new Date(),
  });

  if (empId) {
    const week = [0, 1, 2, 3, 4].map((n) => daysAgo(-n));
    await db.collection("shift_assignments").insertMany(
      week.map((date) => ({
        org: orgId,
        employeeId: empId,
        templateId: String(shiftTplRes.insertedId),
        date,
        startTime: "08:00",
        endTime: "17:00",
        notes: `${branchLabel} shift`,
        demoSeed: true,
        createdOn: new Date(),
      }))
    );
  }

  const wfTplRes = await db.collection("workflow_templates").insertOne({
    org: orgId,
    name: `${branchLabel} Leave approval`,
    type: "leave",
    steps: [
      { role: "SUPERVISOR", order: 0 },
      { role: "HR_MANAGER", order: 1 },
    ],
    demoSeed: true,
    createdOn: new Date(),
  });

  await db.collection("approval_requests").insertMany([
    {
      org: orgId,
      type: "leave",
      resourceType: "leave",
      resourceId: null,
      requesterId: empId,
      status: "pending",
      currentStep: 0,
      steps: wfTplRes.steps || [],
      history: [{ action: "submitted", by: empId, at: new Date() }],
      demoSeed: true,
      createdOn: new Date(),
    },
  ]);

  const jobRes = await db.collection("job_postings").insertOne({
    org: orgId,
    title: profile.jobTitle,
    department: profile.jobDepartment,
    description: `Open role at ${profile.location}.`,
    status: "open",
    location: profile.location,
    demoSeed: true,
    createdOn: new Date(),
  });

  await db.collection("candidates").insertMany([
    {
      org: orgId,
      jobId: String(jobRes.insertedId),
      name: "Candidate One",
      email: `c1.${branchLabel.toLowerCase()}@demo.com`,
      stage: "applied",
      score: 70,
      demoSeed: true,
      createdOn: new Date(),
    },
    {
      org: orgId,
      jobId: String(jobRes.insertedId),
      name: "Candidate Two",
      email: `c2.${branchLabel.toLowerCase()}@demo.com`,
      stage: "interview",
      score: 82,
      demoSeed: true,
      createdOn: new Date(),
    },
  ]);

  const obTasks = [
    { title: "Sign contract", dueDays: 1, required: true },
    { title: "Branch orientation", dueDays: 3, required: true },
    { title: "Meet branch manager", dueDays: 5, required: false },
  ];
  const obTplRes = await db.collection("onboarding_templates").insertOne({
    org: orgId,
    name: `${branchLabel} onboarding`,
    tasks: obTasks,
    demoSeed: true,
    createdOn: new Date(),
  });

  if (empId) {
    await db.collection("onboarding_instances").insertOne({
      org: orgId,
      employeeId: empId,
      templateId: String(obTplRes.insertedId),
      tasks: obTasks.map((t, i) => ({
        ...t,
        id: i,
        completed: i === 0,
        completedOn: i === 0 ? new Date() : null,
      })),
      status: "in_progress",
      progress: 33,
      probationEnd: daysAgo(-90),
      demoSeed: true,
      createdOn: new Date(),
    });

    await db.collection("performance_goals").insertMany([
      {
        org: orgId,
        employeeId: empId,
        title: `${branchLabel} KPI — Q2`,
        target: "100%",
        dueDate: daysAgo(-30),
        status: "active",
        progress: 75,
        demoSeed: true,
        createdOn: new Date(),
      },
    ]);

    await db.collection("performance_reviews").insertOne({
      org: orgId,
      employeeId: empId,
      period: "Q1 2026",
      selfReview: "Met branch targets.",
      managerReview: "Reliable branch contributor.",
      score: 4.0,
      status: "completed",
      reviewerId: String(adminId),
      demoSeed: true,
      createdOn: new Date(),
    });
  }

  const courseRes = await db.collection("training_courses").insertOne({
    org: orgId,
    title: `${branchLabel} Compliance Training`,
    description: "Branch-specific compliance module",
    durationHours: 3,
    category: "compliance",
    demoSeed: true,
    createdOn: new Date(),
  });

  if (empId) {
    await db.collection("training_records").insertMany([
      {
        org: orgId,
        employeeId: empId,
        courseId: String(courseRes.insertedId),
        status: "completed",
        progress: 100,
        assignedOn: new Date(daysAgo(15)),
        completedOn: new Date(daysAgo(13)),
        demoSeed: true,
      },
      ...(employees[1]
        ? [
            {
              org: orgId,
              employeeId: String(employees[1]._id),
              courseId: String(courseRes.insertedId),
              status: "assigned",
              progress: 25,
              assignedOn: new Date(daysAgo(3)),
              completedOn: null,
              demoSeed: true,
            },
          ]
        : []),
    ]);

    await db.collection("documents").insertMany([
      {
        org: orgId,
        employeeId: empId,
        category: "contract",
        title: `${branchLabel} Employment Contract`,
        filename: `contract-${branchLabel.toLowerCase()}.pdf`,
        path: `uploads/documents/demo-contract-${branchLabel.toLowerCase()}.pdf`,
        mimeType: "application/pdf",
        size: 102400,
        version: 1,
        uploadedBy: String(adminId),
        demoSeed: true,
        createdOn: new Date(),
        updatedOn: new Date(),
      },
    ]);
  }
}

async function seedSettings(db, orgId) {
  await db.collection("org_settings").updateOne(
    { org: orgId },
    {
      $set: {
        org: orgId,
        payroll: {
          currency: "ETB",
          payDay: 25,
          taxRate: 0.15,
          overtimeMultiplier: 1.5,
          lockAfterDays: 7,
        },
        leave: {
          requireApproval: true,
          maxCarryOverDays: 5,
          allowNegativeBalance: false,
        },
        attendance: {
          gracePeriodMinutes: 15,
          autoCheckoutHours: 10,
          requireApproval: true,
        },
        notifications: {
          emailEnabled: true,
          leaveReminderDays: 3,
          documentExpiryDays: 30,
        },
        customFields: [
          {
            key: "tshirtSize",
            label: "T-shirt size",
            type: "select",
            options: ["S", "M", "L", "XL"],
            section: "employee",
          },
          {
            key: "emergencyContact",
            label: "Emergency contact",
            type: "text",
            section: "employee",
          },
        ],
        updatedOn: new Date(),
        demoSeed: true,
      },
    },
    { upsert: true }
  );
}

async function seedAuditSamples(db, orgId, admin, branchLabel) {
  await db.collection("audit_logs").insertMany([
    {
      org: orgId,
      actorId: String(admin._id),
      actorEmail: admin.email,
      actorRole: admin.role,
      action: "employee.import",
      resource: "employee",
      summary: `Demo seed: ${branchLabel} branch employees`,
      metadata: { ip: "127.0.0.1", demoSeed: true, branch: branchLabel },
      createdOn: new Date(),
    },
    {
      org: orgId,
      actorId: String(admin._id),
      actorEmail: admin.email,
      actorRole: admin.role,
      action: "payroll.generate",
      resource: "payroll",
      summary: `Demo seed: ${branchLabel} payroll`,
      metadata: { ip: "127.0.0.1", demoSeed: true, branch: branchLabel },
      createdOn: new Date(),
    },
  ]);
}

async function seedBranch(db, branchOrg, admin) {
  const orgId = String(branchOrg._id);
  const orgOid = branchOrg._id;
  const profile = profileForOrg(branchOrg);
  const branchLabel = branchOrg.branch || profile.code;

  const departments = await ensureDepartments(db, orgId, profile);
  const positions = await ensurePositions(db, orgId, departments, profile);
  const employees = await seedEmployees(
    db,
    orgId,
    orgOid,
    departments,
    positions,
    profile
  );
  await seedLeaveTypesAndHolidays(db, orgId, branchLabel);
  await seedLeaveAllowances(db, employees);
  await seedLeaves(db, orgId, orgOid, employees);
  await seedAttendance(db, orgId, employees, profile);
  await seedPayroll(db, orgId, employees, admin._id, branchLabel);
  await seedPlatformModules(db, orgId, employees, admin._id, profile);
  await seedSettings(db, orgId);
  await seedAuditSamples(db, orgId, admin, branchLabel);

  return {
    orgId,
    branch: branchLabel,
    code: profile.code,
    counts: {
      employees: employees.length,
      departments: departments.length,
      positions: positions.length,
    },
    departments,
  };
}

async function main() {
  const force = process.argv.includes("--force") || process.env.SEED_FORCE === "1";
  const client = new MongoClient(mongodbURI);
  await client.connect();
  const db = client.db(dbName);

  const { admin, homeOrgId } = await getAdminContext(db);
  const branches = await getCompanyBranches(db, homeOrgId);
  const branchOrgIds = branches.map((b) => String(b._id));

  const existing = await db.collection("seed_meta").findOne({ key: SEED_KEY });
  if (existing && !force) {
    console.log(
      JSON.stringify(
        {
          ok: true,
          skipped: true,
          message:
            "Branch demo data already seeded. Use npm run seed:demo:force to re-seed.",
          branches: branchOrgIds,
        },
        null,
        2
      )
    );
    await client.close();
    return;
  }

  await clearDemoDataForBranches(db, branchOrgIds);

  const results = [];
  let mainDepartments = [];

  for (const branchOrg of branches) {
    const result = await seedBranch(db, branchOrg, admin);
    results.push(result);
    if (branchOrg.isMainBranch || String(branchOrg.branch).toLowerCase() === "main") {
      mainDepartments = result.departments;
    }
  }

  if (mainDepartments.length) {
    await seedDemoUsers(db, homeOrgId, mainDepartments);
  }

  await db.collection("seed_meta").updateOne(
    { key: SEED_KEY },
    {
      $set: {
        key: SEED_KEY,
        companyOrg: homeOrgId,
        branches: branchOrgIds,
        seededAt: new Date(),
        results,
      },
    },
    { upsert: true }
  );

  console.log(
    JSON.stringify(
      {
        ok: true,
        seeded: true,
        branches: results,
        logins: {
          admin: {
            email: admin.email,
            password: process.env.DEV_ADMIN_PASSWORD || "DevAdmin123!",
          },
          hr: { email: "hr@essethr.local", password: PASSWORD_DEMO },
          supervisor: {
            email: "supervisor@essethr.local",
            password: PASSWORD_DEMO,
          },
          employee: {
            email: "employee@essethr.local",
            password: process.env.DEV_EMPLOYEE_PASSWORD || "DevEmployee123!",
          },
        },
        hint:
          "Switch branches in the top bar. Each branch has its own employees, payroll, attendance, and modules.",
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

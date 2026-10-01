const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting CampusAttend Database Seeding...');

  // Hash standard password for all demo accounts
  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 1. Create System Settings
  console.log('Creating system settings...');
  await prisma.systemSetting.upsert({
    where: { key: 'MIN_ATTENDANCE_PERCENTAGE' },
    update: { value: '75' },
    create: {
      key: 'MIN_ATTENDANCE_PERCENTAGE',
      value: '75',
      description: 'Minimum required attendance percentage threshold',
    },
  });

  await prisma.systemSetting.upsert({
    where: { key: 'WARNING_ATTENDANCE_PERCENTAGE' },
    update: { value: '65' },
    create: {
      key: 'WARNING_ATTENDANCE_PERCENTAGE',
      value: '65',
      description: 'Warning attendance percentage threshold',
    },
  });

  // 2. Create Admin User
  console.log('Creating Admin account...');
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@campusattend.local' },
    update: {},
    create: {
      name: 'Dr. Principal Admin',
      email: 'admin@campusattend.local',
      passwordHash: passwordHash,
      role: 'ADMIN',
      phone: '+91 9876543210',
    },
  });

  // 3. Create Departments
  console.log('Creating Departments...');
  const deptCSE = await prisma.department.upsert({
    where: { code: 'CSE' },
    update: {},
    create: {
      name: 'Computer Science and Engineering',
      code: 'CSE',
      description: 'Department of Computer Science & Engineering',
    },
  });

  const deptCS = await prisma.department.upsert({
    where: { code: 'CS' },
    update: {},
    create: {
      name: 'Cyber Security',
      code: 'CS',
      description: 'Department of Cyber Security',
    },
  });

  const deptECE = await prisma.department.upsert({
    where: { code: 'ECE' },
    update: {},
    create: {
      name: 'Electronics & Communication Engineering',
      code: 'ECE',
      description: 'Department of ECE',
    },
  });

  // 4. Create Courses
  console.log('Creating Courses...');
  const courseBTechCSE = await prisma.course.upsert({
    where: { code: 'BTECH-CSE' },
    update: {},
    create: {
      name: 'B.Tech Computer Science & Engineering',
      code: 'BTECH-CSE',
      departmentId: deptCSE.id,
      durationYears: 4,
    },
  });

  const courseBTechCS = await prisma.course.upsert({
    where: { code: 'BTECH-CS' },
    update: {},
    create: {
      name: 'B.Tech Cyber Security',
      code: 'BTECH-CS',
      departmentId: deptCS.id,
      durationYears: 4,
    },
  });

  // 5. Create Sections
  console.log('Creating Sections...');
  const sectionCseA = await prisma.section.create({
    data: {
      name: 'CSE-A',
      courseId: courseBTechCSE.id,
      year: 3,
      semester: 5,
      academicYear: '2025-2026',
    },
  });

  const sectionCseB = await prisma.section.create({
    data: {
      name: 'CSE-B',
      courseId: courseBTechCSE.id,
      year: 3,
      semester: 5,
      academicYear: '2025-2026',
    },
  });

  const sectionCsA = await prisma.section.create({
    data: {
      name: 'CS-A',
      courseId: courseBTechCS.id,
      year: 3,
      semester: 5,
      academicYear: '2025-2026',
    },
  });

  // 6. Create Subjects
  console.log('Creating Subjects...');
  const subjectCN = await prisma.subject.upsert({
    where: { code: 'CS501' },
    update: {},
    create: {
      name: 'Computer Networks',
      code: 'CS501',
      credits: 4,
      semester: 5,
      courseId: courseBTechCSE.id,
      departmentId: deptCSE.id,
    },
  });

  const subjectDBMS = await prisma.subject.upsert({
    where: { code: 'CS502' },
    update: {},
    create: {
      name: 'Database Management Systems',
      code: 'CS502',
      credits: 4,
      semester: 5,
      courseId: courseBTechCSE.id,
      departmentId: deptCSE.id,
    },
  });

  const subjectOS = await prisma.subject.upsert({
    where: { code: 'CS503' },
    update: {},
    create: {
      name: 'Operating Systems',
      code: 'CS503',
      credits: 4,
      semester: 5,
      courseId: courseBTechCSE.id,
      departmentId: deptCSE.id,
    },
  });

  const subjectSE = await prisma.subject.upsert({
    where: { code: 'CS504' },
    update: {},
    create: {
      name: 'Software Engineering',
      code: 'CS504',
      credits: 3,
      semester: 5,
      courseId: courseBTechCSE.id,
      departmentId: deptCSE.id,
    },
  });

  const subjectWT = await prisma.subject.upsert({
    where: { code: 'CS505' },
    update: {},
    create: {
      name: 'Web Technologies',
      code: 'CS505',
      credits: 3,
      semester: 5,
      courseId: courseBTechCSE.id,
      departmentId: deptCSE.id,
    },
  });

  // 7. Create Faculty Members
  console.log('Creating Faculty accounts...');
  const facultyDataList = [
    {
      name: 'Dr. K. Sharma',
      email: 'faculty@campusattend.local',
      employeeId: 'EMP-CSE-001',
      designation: 'Professor & HOD',
      phone: '+91 9811111111',
      deptId: deptCSE.id,
    },
    {
      name: 'Prof. S. Rao',
      email: 'faculty2@campusattend.local',
      employeeId: 'EMP-CSE-002',
      designation: 'Associate Professor',
      phone: '+91 9822222222',
      deptId: deptCSE.id,
    },
    {
      name: 'Dr. M. Verma',
      email: 'faculty3@campusattend.local',
      employeeId: 'EMP-CSE-003',
      designation: 'Assistant Professor',
      phone: '+91 9833333333',
      deptId: deptCSE.id,
    },
    {
      name: 'Prof. A. Gupta',
      email: 'faculty4@campusattend.local',
      employeeId: 'EMP-CSE-004',
      designation: 'Assistant Professor',
      phone: '+91 9844444444',
      deptId: deptCSE.id,
    },
    {
      name: 'Dr. R. Kumar',
      email: 'faculty5@campusattend.local',
      employeeId: 'EMP-CS-001',
      designation: 'Associate Professor',
      phone: '+91 9855555555',
      deptId: deptCS.id,
    },
  ];

  const createdFacultyList = [];

  for (const item of facultyDataList) {
    const user = await prisma.user.upsert({
      where: { email: item.email },
      update: {},
      create: {
        name: item.name,
        email: item.email,
        passwordHash: passwordHash,
        role: 'FACULTY',
        phone: item.phone,
      },
    });

    const fac = await prisma.faculty.upsert({
      where: { employeeId: item.employeeId },
      update: {},
      create: {
        userId: user.id,
        employeeId: item.employeeId,
        name: item.name,
        email: item.email,
        phone: item.phone,
        departmentId: item.deptId,
        designation: item.designation,
      },
    });

    createdFacultyList.push(fac);
  }

  // Assign Faculty to Subjects & Sections
  console.log('Assigning Faculty to Subjects...');
  const mainFaculty = createdFacultyList[0]; // Dr. K. Sharma
  const fac2 = createdFacultyList[1];
  const fac3 = createdFacultyList[2];
  const fac4 = createdFacultyList[3];

  await prisma.facultySubject.createMany({
    data: [
      { facultyId: mainFaculty.id, subjectId: subjectCN.id, sectionId: sectionCseA.id, academicYear: '2025-2026' },
      { facultyId: mainFaculty.id, subjectId: subjectDBMS.id, sectionId: sectionCseA.id, academicYear: '2025-2026' },
      { facultyId: fac2.id, subjectId: subjectOS.id, sectionId: sectionCseA.id, academicYear: '2025-2026' },
      { facultyId: fac3.id, subjectId: subjectSE.id, sectionId: sectionCseA.id, academicYear: '2025-2026' },
      { facultyId: fac4.id, subjectId: subjectWT.id, sectionId: sectionCseA.id, academicYear: '2025-2026' },

      { facultyId: mainFaculty.id, subjectId: subjectCN.id, sectionId: sectionCseB.id, academicYear: '2025-2026' },
      { facultyId: fac2.id, subjectId: subjectDBMS.id, sectionId: sectionCseB.id, academicYear: '2025-2026' },
    ],
  });

  // 8. Create Students
  console.log('Creating 50 Students for CSE-A, CSE-B, CS-A...');
  const firstNames = ['Rahul', 'Priya', 'Kiran', 'Ananya', 'Aarav', 'Vikram', 'Sneha', 'Rohan', 'Neha', 'Aditya', 'Pooja', 'Sanjay', 'Meera', 'Varun', 'Kavya'];
  const lastNames = ['Sharma', 'Rao', 'Verma', 'Gupta', 'Kumar', 'Reddy', 'Singh', 'Joshi', 'Patel', 'Nair'];

  const createdStudents = [];

  for (let i = 1; i <= 50; i++) {
    const fn = firstNames[(i - 1) % firstNames.length];
    const ln = lastNames[(i - 1) % lastNames.length];
    const fullName = i === 1 ? 'Rahul Sharma' : `${fn} ${ln}`;
    const email = i === 1 ? 'student@campusattend.local' : `student${i}@campusattend.local`;
    const rollNo = `21A0${i < 10 ? '0' + i : i}`;
    const studentId = `STU-2026-${1000 + i}`;

    const section = i <= 25 ? sectionCseA : i <= 40 ? sectionCseB : sectionCsA;
    const dept = i <= 40 ? deptCSE : deptCS;
    const course = i <= 40 ? courseBTechCSE : courseBTechCS;

    const user = await prisma.user.upsert({
      where: { email: email },
      update: {},
      create: {
        name: fullName,
        email: email,
        passwordHash: passwordHash,
        role: 'STUDENT',
        phone: `+91 900000${100 + i}`,
      },
    });

    const student = await prisma.student.upsert({
      where: { rollNumber: rollNo },
      update: {},
      create: {
        userId: user.id,
        studentId: studentId,
        rollNumber: rollNo,
        name: fullName,
        email: email,
        phone: user.phone,
        departmentId: dept.id,
        courseId: course.id,
        sectionId: section.id,
        year: 3,
        semester: 5,
        academicYear: '2025-2026',
        admissionYear: 2023,
      },
    });

    createdStudents.push(student);
  }

  // 9. Seed Timetable
  console.log('Seeding Timetable...');
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timetableSlots = [
    { subject: subjectCN, faculty: mainFaculty, startTime: '09:00', endTime: '10:00', hour: 1 },
    { subject: subjectDBMS, faculty: mainFaculty, startTime: '10:00', endTime: '11:00', hour: 2 },
    { subject: subjectOS, faculty: fac2, startTime: '11:15', endTime: '12:15', hour: 3 },
    { subject: subjectSE, faculty: fac3, startTime: '13:15', endTime: '14:15', hour: 4 },
    { subject: subjectWT, faculty: fac4, startTime: '14:15', endTime: '15:15', hour: 5 },
  ];

  for (const day of days) {
    for (const slot of timetableSlots) {
      await prisma.timetable.create({
        data: {
          sectionId: sectionCseA.id,
          subjectId: slot.subject.id,
          facultyId: slot.faculty.id,
          dayOfWeek: day,
          startTime: slot.startTime,
          endTime: slot.endTime,
          roomNumber: 'LH-301',
        },
      });
    }
  }

  // 10. Seed Historical Attendance Sessions & Records for CSE-A
  console.log('Seeding historical attendance sessions and records for past 20 days...');
  const cseAStudents = createdStudents.filter((s) => s.sectionId === sectionCseA.id);

  const subjectsList = [subjectCN, subjectDBMS, subjectOS, subjectSE, subjectWT];
  const facultyMap = {
    [subjectCN.id]: mainFaculty,
    [subjectDBMS.id]: mainFaculty,
    [subjectOS.id]: fac2,
    [subjectSE.id]: fac3,
    [subjectWT.id]: fac4,
  };

  const today = new Date();

  for (let d = 25; d >= 1; d--) {
    const sessionDate = new Date();
    sessionDate.setDate(today.getDate() - d);
    
    // Skip weekends
    if (sessionDate.getDay() === 0 || sessionDate.getDay() === 6) continue;

    const dateStr = sessionDate.toISOString().split('T')[0];

    // Create 2-3 sessions per day
    for (let h = 1; h <= 3; h++) {
      const subj = subjectsList[(d + h) % subjectsList.length];
      const fac = facultyMap[subj.id];

      try {
        const session = await prisma.attendanceSession.create({
          data: {
            subjectId: subj.id,
            sectionId: sectionCseA.id,
            facultyId: fac.id,
            date: dateStr,
            hour: h,
            topic: `${subj.name} - Lecture Unit ${Math.floor(d / 5) + 1}`,
            status: 'SUBMITTED',
          },
        });

        // Add records for all students in CSE-A
        const recordsData = cseAStudents.map((st, idx) => {
          // Rahul Sharma (idx 0) has 85% attendance
          let status = 'PRESENT';
          if (idx === 0) {
            // Rahul Sharma
            status = (d + h) % 7 === 0 ? 'ABSENT' : (d + h) % 13 === 0 ? 'LATE' : 'PRESENT';
          } else {
            // Random pattern per student
            const rand = (idx * 17 + d * 7 + h * 3) % 100;
            if (rand < 78) status = 'PRESENT';
            else if (rand < 88) status = 'ABSENT';
            else if (rand < 95) status = 'LATE';
            else status = 'EXCUSED';
          }

          return {
            sessionId: session.id,
            studentId: st.id,
            status: status,
            markedBy: fac.userId,
            remarks: status === 'LATE' ? 'Came 10 mins late' : status === 'EXCUSED' ? 'Medical leave approval' : null,
          };
        });

        await prisma.attendanceRecord.createMany({
          data: recordsData,
        });
      } catch (err) {
        // Skip duplicate sessions if any
      }
    }
  }

  // Create initial audit log entry
  await prisma.auditLog.create({
    data: {
      userId: adminUser.id,
      action: 'SYSTEM_INITIALIZED',
      entity: 'SystemSetting',
      entityId: 'ALL',
      newValue: 'Initial CampusAttend system setup and seed data generated.',
      ipAddress: '127.0.0.1',
    },
  });

  console.log('✅ CampusAttend Database Seeding Completed Successfully!');
  console.log('\n--- DEMO LOGIN CREDENTIALS ---');
  console.log('Admin:   admin@campusattend.local   / Password123!');
  console.log('Faculty: faculty@campusattend.local / Password123!');
  console.log('Student: student@campusattend.local / Password123!');
  console.log('-------------------------------\n');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

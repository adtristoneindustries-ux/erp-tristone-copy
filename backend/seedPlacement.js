require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Company = require('./models/Company');
const PlacementDrive = require('./models/PlacementDrive');

const seedPlacementData = async () => {
  try {
    await connectDB();
    console.log('🔄 Seeding placement data...');

    // Get existing staff member or create one
    let placementStaff = await User.findOne({ role: 'staff' });
    
    if (!placementStaff) {
      placementStaff = await User.create({
        name: 'Placement Officer',
        email: 'placement@school.com',
        password: 'placement123',
        role: 'staff',
        department: 'Placement Cell',
        status: 'Active'
      });
      console.log('✅ Placement staff created');
    } else {
      console.log('✅ Using existing staff member for placement');
    }

    // Create sample students with placement data
    const existingStudents = await User.find({ role: 'student' }).limit(3);
    
    if (existingStudents.length < 3) {
      await User.create([
        {
          name: 'Alice Johnson',
          email: 'alice@student.com',
          password: 'student123',
          role: 'student',
          department: 'Computer Science',
          year: 4,
          cgpa: 8.5,
          arrears_count: 0,
          rollNumber: 'CS2021001',
          skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
          resume_url: 'https://drive.google.com/sample-resume-alice'
        },
        {
          name: 'Bob Smith',
          email: 'bob@student.com',
          password: 'student123',
          role: 'student',
          department: 'Information Technology',
          year: 4,
          cgpa: 7.8,
          arrears_count: 1,
          rollNumber: 'IT2021002',
          skills: ['Python', 'Django', 'SQL', 'AWS'],
          resume_url: 'https://drive.google.com/sample-resume-bob'
        },
        {
          name: 'Carol White',
          email: 'carol@student.com',
          password: 'student123',
          role: 'student',
          department: 'Computer Science',
          year: 4,
          cgpa: 9.2,
          arrears_count: 0,
          rollNumber: 'CS2021003',
          skills: ['Java', 'Spring Boot', 'Microservices', 'Docker'],
          resume_url: 'https://drive.google.com/sample-resume-carol'
        }
      ]);
      console.log('✅ Sample students created');
    } else {
      // Update existing students with placement data
      await User.updateMany(
        { role: 'student' },
        { 
          $set: { 
            cgpa: 8.0,
            arrears_count: 0,
            skills: ['JavaScript', 'React', 'Node.js']
          }
        }
      );
      console.log('✅ Updated existing students with placement data');
    }

    // Get admin user
    const admin = await User.findOne({ role: 'admin' });

    // Create companies
    const companies = await Company.create([
      {
        company_name: 'TechCorp Solutions',
        hr_name: 'Sarah Manager',
        hr_contact: '+91-9876543210',
        hr_email: 'hr@techcorp.com',
        location: 'Bangalore',
        created_by: admin._id
      },
      {
        company_name: 'InnovateSoft',
        hr_name: 'Mike Recruiter',
        hr_contact: '+91-9876543211',
        hr_email: 'careers@innovatesoft.com',
        location: 'Hyderabad',
        created_by: admin._id
      },
      {
        company_name: 'DataDrive Inc',
        hr_name: 'Emma Talent',
        hr_contact: '+91-9876543212',
        hr_email: 'jobs@datadrive.com',
        location: 'Chennai',
        created_by: admin._id
      }
    ]);
    console.log('✅ Companies created');

    // Create placement drives
    const drives = await PlacementDrive.create([
      {
        company_id: companies[0]._id,
        job_role: 'Full Stack Developer',
        salary_lpa: 8.5,
        eligibility_cgpa: 7.5,
        arrears_limit: 0,
        required_skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
        drive_date: new Date('2024-02-15'),
        status: 'open',
        assigned_officer_id: placementStaff._id
      },
      {
        company_id: companies[1]._id,
        job_role: 'Backend Developer',
        salary_lpa: 7.0,
        eligibility_cgpa: 7.0,
        arrears_limit: 1,
        required_skills: ['Python', 'Django', 'PostgreSQL'],
        drive_date: new Date('2024-02-20'),
        status: 'open',
        assigned_officer_id: placementStaff._id
      },
      {
        company_id: companies[2]._id,
        job_role: 'Java Developer',
        salary_lpa: 9.0,
        eligibility_cgpa: 8.0,
        arrears_limit: 0,
        required_skills: ['Java', 'Spring Boot', 'Microservices'],
        drive_date: new Date('2024-02-25'),
        status: 'ongoing',
        assigned_officer_id: placementStaff._id
      }
    ]);
    console.log('✅ Placement drives created');

    console.log('\n📋 PLACEMENT MODULE CREDENTIALS:');
    console.log('================================');
    console.log('Placement Staff (use existing staff login):');
    console.log('  Email:', placementStaff.email);
    console.log('  Access: /staff/placement');
    console.log('\nAdmin can assign any staff member to placement drives');
    console.log('================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding placement data:', error);
    process.exit(1);
  }
};

seedPlacementData();

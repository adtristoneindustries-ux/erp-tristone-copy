import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const AdminAddStaff = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const editingStaff = location.state?.editingStaff;
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    // Basic Info
    fullName: '', profilePhoto: null, staffId: '', employeeCode: '', dateOfBirth: '',
    gender: '', bloodGroup: '', aadhaarNumber: '', panNumber: '', nationality: 'Indian',
    religion: '', casteCategory: '', maritalStatus: '', identificationMark1: '', identificationMark2: '',
    // Professional
    department: '', designation: '', employmentType: '', dateOfJoining: '', yearsOfExperience: '',
    previousInstitution: '', qualification: '', specialization: '', subjectsHandling: [],
    classAssigned: [], sectionAssigned: [], employeeStatus: 'Active',
    // Salary
    basicSalary: '', allowances: '', pfNumber: '', esiNumber: '', taxDeduction: '',
    salaryAccountNumber: '', bankName: '', ifscCode: '', branchName: '', uanNumber: '',
    // Contact
    phone: '', alternateContact: '', email: '', emergencyContactName: '', emergencyContactNumber: '',
    // Address
    permanentAddress: '', currentAddress: '', sameAsPermanent: false, city: '', district: '',
    state: '', pincode: '', country: 'India',
    // Medical
    medicalConditions: '', disability: false, disabilityDetails: '', healthInsurance: '',
    emergencyMedicalContact: '',
    // Teaching
    classIncharge: false, isHOD: false, timetableAssigned: false, labIncharge: false,
    mentorAssignedClasses: [],
    // Hostel
    accommodationRequired: false, accommodationRoomNumber: '', accommodationBlock: '',
    accommodationWardenName: '',
    // Documents
    documents: [],
    // System
    role: 'staff', password: 'staff123', loginAccess: true, permissionLevel: 'Staff'
  });

  const steps = [
    { id: 1, title: 'Basic Information' },
    { id: 2, title: 'Professional Details' },
    { id: 3, title: 'Salary & Payroll' },
    { id: 4, title: 'Contact Information' },
    { id: 5, title: 'Address Information' },
    { id: 6, title: 'Medical Information' },
    { id: 7, title: 'Teaching Details' },
    { id: 8, title: 'Accommodation' },
    { id: 9, title: 'Documents Upload' },
    { id: 10, title: 'System Access' }
  ];

  useEffect(() => {
    if (editingStaff) {
      setFormData({
        ...formData,
        ...editingStaff,
        dateOfBirth: editingStaff.dateOfBirth?.split('T')[0] || '',
        dateOfJoining: editingStaff.dateOfJoining?.split('T')[0] || '',
      });
    } else {
      generateStaffId();
    }
  }, [editingStaff]);

  const generateStaffId = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/users?role=staff', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const year = new Date().getFullYear();
      const count = res.data.length + 1;
      setFormData(prev => ({ ...prev, staffId: `ST-${year}-${String(count).padStart(3, '0')}` }));
    } catch (error) {
      console.error('Error generating staff ID:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
      if (name === 'sameAsPermanent' && checked) {
        setFormData(prev => ({ ...prev, currentAddress: prev.permanentAddress }));
      }
    } else if (type === 'file') {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    } else {
      // Auto-uppercase for PAN number
      const finalValue = name === 'panNumber' ? value.toUpperCase() : value;
      setFormData(prev => ({ ...prev, [name]: finalValue }));
    }
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleMultiSelect = (name, value) => {
    setFormData(prev => {
      const current = prev[name] || [];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [name]: updated };
    });
  };

  const handleDocumentUpload = (e) => {
    const files = Array.from(e.target.files);
    const docType = e.target.dataset.doctype;
    const newDocs = files.map(file => ({ type: docType, file, name: file.name }));
    setFormData(prev => ({ ...prev, documents: [...prev.documents, ...newDocs] }));
  };

  const removeDocument = (index) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!formData.fullName) newErrors.fullName = 'Full name is required';
      if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
      if (!formData.gender) newErrors.gender = 'Gender is required';
      if (formData.aadhaarNumber && !/^\d{12}$/.test(formData.aadhaarNumber)) {
        newErrors.aadhaarNumber = 'Aadhaar must be 12 digits';
      }
      // PAN validation is optional - skip if empty
      if (formData.panNumber && formData.panNumber.trim().length > 0) {
        const panUpper = formData.panNumber.toUpperCase().trim();
        if (panUpper.length !== 10 || !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(panUpper)) {
          newErrors.panNumber = 'PAN must be 10 characters: 5 letters, 4 digits, 1 letter (e.g., ABCDE1234F)';
        }
      }
    }
    
    if (step === 2) {
      if (!formData.department) newErrors.department = 'Department is required';
      if (!formData.designation) newErrors.designation = 'Designation is required';
      if (!formData.dateOfJoining) newErrors.dateOfJoining = 'Date of joining is required';
    }
    
    if (step === 4) {
      if (!formData.phone) newErrors.phone = 'Mobile number is required';
      if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
        newErrors.phone = 'Mobile must be 10 digits';
      }
      if (!formData.email) newErrors.email = 'Email is required';
      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Invalid email format';
      }
      if (formData.emergencyContactNumber && !/^\d{10}$/.test(formData.emergencyContactNumber)) {
        newErrors.emergencyContactNumber = 'Emergency contact must be 10 digits';
      }
    }
    
    if (step === 5) {
      if (formData.pincode && !/^\d{6}$/.test(formData.pincode)) {
        newErrors.pincode = 'Pincode must be 6 digits';
      }
    }
    
    if (step === 3) {
      if (formData.ifscCode && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifscCode)) {
        newErrors.ifscCode = 'Invalid IFSC code format';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 10));
    }
  };

  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const saveDraft = async () => {
    try {
      localStorage.setItem('staffDraft', JSON.stringify(formData));
      alert('Draft saved successfully!');
    } catch (error) {
      alert('Error saving draft');
    }
  };

  const loadDraft = () => {
    try {
      const draft = localStorage.getItem('staffDraft');
      if (draft) {
        const draftData = JSON.parse(draft);
        setFormData(draftData);
        alert('Draft loaded successfully!');
      } else {
        alert('No draft found');
      }
    } catch (error) {
      alert('Error loading draft');
    }
  };

  const clearDraft = () => {
    if (window.confirm('Are you sure you want to clear the saved draft?')) {
      localStorage.removeItem('staffDraft');
      alert('Draft cleared successfully!');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      if (editingStaff) {
        const updatePayload = { 
          ...formData,
          name: formData.fullName || formData.name
        };
        delete updatePayload.password;
        await axios.put(`http://localhost:5000/api/users/${editingStaff._id}`, updatePayload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Staff updated successfully!');
      } else {
        const submitData = new FormData();
        
        const userData = {
          ...formData,
          name: formData.fullName,
          email: formData.email,
          password: formData.password || 'staff123',
          role: 'staff'
        };
        
        // Remove file fields from userData
        delete userData.profilePhoto;
        delete userData.documents;
        
        submitData.append('userData', JSON.stringify(userData));
        
        // Handle profile photo
        if (formData.profilePhoto) {
          submitData.append('passportPhoto', formData.profilePhoto);
        }
        
        // Handle documents
        if (formData.documents && formData.documents.length > 0) {
          formData.documents.forEach(doc => {
            submitData.append('documents', doc.file);
          });
          const docTypes = formData.documents.map(d => d.type);
          submitData.append('docTypes', JSON.stringify(docTypes));
        }
        
        await axios.post('http://localhost:5000/api/users/staff-with-docs', submitData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        alert('Staff registered successfully!');
        localStorage.removeItem('staffDraft');
      }
      
      navigate('/admin/staff');
    } catch (error) {
      alert(error.response?.data?.message || 'Error processing staff');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <Navbar />
        <div className="p-4 md:p-6">
          <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">{editingStaff ? 'Edit Staff' : 'Add New Staff'}</h1>
            <div className="flex gap-2">
              <button onClick={loadDraft} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Load Draft
              </button>
              <button onClick={clearDraft} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
                Clear Draft
              </button>
              <button onClick={() => navigate('/admin/staff')} className="text-gray-600 hover:text-gray-800">
                ✕ Close
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              {steps.map(step => (
                <div key={step.id} className={`flex-1 text-center ${step.id <= currentStep ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${
                    step.id <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-300'
                  }`}>
                    {step.id}
                  </div>
                  <p className="text-xs mt-1 hidden md:block">{step.title}</p>
                </div>
              ))}
            </div>
            <div className="w-full bg-gray-200 h-2 rounded">
              <div className="bg-blue-600 h-2 rounded transition-all" style={{ width: `${(currentStep / 10) * 100}%` }}></div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold mb-4">Basic Staff Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Full Name (As per Aadhaar) *</label>
                    <input type="text" name="fullName" value={formData.fullName} onChange={handleChange}
                      className="w-full border rounded px-3 py-2" />
                    {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Profile Photo</label>
                    <input type="file" name="profilePhoto" onChange={handleChange} accept="image/*"
                      className="w-full border rounded px-3 py-2" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Staff ID (Auto Generated)</label>
                    <input type="text" value={formData.staffId} readOnly
                      className="w-full border rounded px-3 py-2 bg-gray-100" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Employee Code</label>
                    <input type="text" name="employeeCode" value={formData.employeeCode} onChange={handleChange}
                      className="w-full border rounded px-3 py-2" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Date of Birth *</label>
                    <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange}
                      className="w-full border rounded px-3 py-2" />
                    {errors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Gender *</label>
                    <select name="gender" value={formData.gender} onChange={handleChange}
                      className="w-full border rounded px-3 py-2">
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Blood Group</label>
                    <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange}
                      className="w-full border rounded px-3 py-2">
                      <option value="">Select Blood Group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Aadhaar Number</label>
                    <input type="text" name="aadhaarNumber" value={formData.aadhaarNumber} onChange={handleChange}
                      maxLength="12" placeholder="12 digits" className="w-full border rounded px-3 py-2" />
                    {errors.aadhaarNumber && <p className="text-red-500 text-xs mt-1">{errors.aadhaarNumber}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">PAN Number</label>
                    <input type="text" name="panNumber" value={formData.panNumber} onChange={handleChange}
                      maxLength="10" placeholder="ABCDE1234F" className="w-full border rounded px-3 py-2" />
                    {errors.panNumber && <p className="text-red-500 text-xs mt-1">{errors.panNumber}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Nationality</label>
                    <input type="text" name="nationality" value={formData.nationality} onChange={handleChange}
                      className="w-full border rounded px-3 py-2" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Religion</label>
                    <select name="religion" value={formData.religion} onChange={handleChange}
                      className="w-full border rounded px-3 py-2">
                      <option value="">Select Religion</option>
                      <option value="Hindu">Hindu</option>
                      <option value="Muslim">Muslim</option>
                      <option value="Christian">Christian</option>
                      <option value="Sikh">Sikh</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Caste Category</label>
                    <select name="casteCategory" value={formData.casteCategory} onChange={handleChange}
                      className="w-full border rounded px-3 py-2">
                      <option value="">Select Category</option>
                      <option value="OC">OC</option>
                      <option value="BC">BC</option>
                      <option value="MBC">MBC</option>
                      <option value="SC">SC</option>
                      <option value="ST">ST</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Marital Status</label>
                    <select name="maritalStatus" value={formData.maritalStatus} onChange={handleChange}
                      className="w-full border rounded px-3 py-2">
                      <option value="">Select Status</option>
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Divorced">Divorced</option>
                      <option value="Widowed">Widowed</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Identification Mark 1</label>
                    <input type="text" name="identificationMark1" value={formData.identificationMark1} onChange={handleChange}
                      className="w-full border rounded px-3 py-2" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Identification Mark 2</label>
                    <input type="text" name="identificationMark2" value={formData.identificationMark2} onChange={handleChange}
                      className="w-full border rounded px-3 py-2" />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Professional Details */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold mb-4">Professional / Employment Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Department *</label>
                    <select name="department" value={formData.department} onChange={handleChange}
                      className="w-full border rounded px-3 py-2">
                      <option value="">Select Department</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="Science">Science</option>
                      <option value="English">English</option>
                      <option value="Social Studies">Social Studies</option>
                      <option value="Admin">Admin</option>
                      <option value="Accounts">Accounts</option>
                      <option value="Library">Library</option>
                      <option value="Sports">Sports</option>
                    </select>
                    {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Designation *</label>
                    <select name="designation" value={formData.designation} onChange={handleChange}
                      className="w-full border rounded px-3 py-2">
                      <option value="">Select Designation</option>
                      <option value="Teacher">Teacher</option>
                      <option value="HOD">HOD</option>
                      <option value="Principal">Principal</option>
                      <option value="Vice Principal">Vice Principal</option>
                      <option value="Clerk">Clerk</option>
                      <option value="Accountant">Accountant</option>
                      <option value="Librarian">Librarian</option>
                      <option value="Lab Assistant">Lab Assistant</option>
                    </select>
                    {errors.designation && <p className="text-red-500 text-xs mt-1">{errors.designation}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Employment Type</label>
                    <select name="employmentType" value={formData.employmentType} onChange={handleChange}
                      className="w-full border rounded px-3 py-2">
                      <option value="">Select Type</option>
                      <option value="Full Time">Full Time</option>
                      <option value="Part Time">Part Time</option>
                      <option value="Contract">Contract</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Date of Joining *</label>
                    <input type="date" name="dateOfJoining" value={formData.dateOfJoining} onChange={handleChange}
                      className="w-full border rounded px-3 py-2" />
                    {errors.dateOfJoining && <p className="text-red-500 text-xs mt-1">{errors.dateOfJoining}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Years of Experience</label>
                    <input type="number" name="yearsOfExperience" value={formData.yearsOfExperience} onChange={handleChange}
                      className="w-full border rounded px-3 py-2" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Previous Institution</label>
                    <input type="text" name="previousInstitution" value={formData.previousInstitution} onChange={handleChange}
                      className="w-full border rounded px-3 py-2" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Qualification</label>
                    <select name="qualification" value={formData.qualification} onChange={handleChange}
                      className="w-full border rounded px-3 py-2">
                      <option value="">Select Qualification</option>
                      <option value="UG">UG</option>
                      <option value="PG">PG</option>
                      <option value="MPhil">MPhil</option>
                      <option value="PhD">PhD</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Specialization</label>
                    <input type="text" name="specialization" value={formData.specialization} onChange={handleChange}
                      className="w-full border rounded px-3 py-2" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Employee Status</label>
                    <select name="employeeStatus" value={formData.employeeStatus} onChange={handleChange}
                      className="w-full border rounded px-3 py-2">
                      <option value="Active">Active</option>
                      <option value="On Leave">On Leave</option>
                      <option value="Resigned">Resigned</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Salary & Payroll */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold mb-4">Salary & Payroll Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Basic Salary</label>
                    <input type="number" name="basicSalary" value={formData.basicSalary} onChange={handleChange}
                      className="w-full border rounded px-3 py-2" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Allowances</label>
                    <input type="number" name="allowances" value={formData.allowances} onChange={handleChange}
                      className="w-full border rounded px-3 py-2" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">PF Number</label>
                    <input type="text" name="pfNumber" value={formData.pfNumber} onChange={handleChange}
                      className="w-full border rounded px-3 py-2" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">ESI Number</label>
                    <input type="text" name="esiNumber" value={formData.esiNumber} onChange={handleChange}
                      className="w-full border rounded px-3 py-2" />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Tax Deduction Details</label>
                    <textarea name="taxDeduction" value={formData.taxDeduction} onChange={handleChange}
                      className="w-full border rounded px-3 py-2" rows="2"></textarea>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Salary Account Number</label>
                    <input type="text" name="salaryAccountNumber" value={formData.salaryAccountNumber} onChange={handleChange}
                      className="w-full border rounded px-3 py-2" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Bank Name</label>
                    <input type="text" name="bankName" value={formData.bankName} onChange={handleChange}
                      className="w-full border rounded px-3 py-2" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">IFSC Code</label>
                    <input type="text" name="ifscCode" value={formData.ifscCode} onChange={handleChange}
                      className="w-full border rounded px-3 py-2 uppercase" />
                    {errors.ifscCode && <p className="text-red-500 text-xs mt-1">{errors.ifscCode}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Branch Name</label>
                    <input type="text" name="branchName" value={formData.branchName} onChange={handleChange}
                      className="w-full border rounded px-3 py-2" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">UAN Number</label>
                    <input type="text" name="uanNumber" value={formData.uanNumber} onChange={handleChange}
                      className="w-full border rounded px-3 py-2" />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Contact Information */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Mobile Number *</label>
                    <input type="text" name="phone" value={formData.phone} onChange={handleChange}
                      maxLength="10" className="w-full border rounded px-3 py-2" />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Alternate Number</label>
                    <input type="text" name="alternateContact" value={formData.alternateContact} onChange={handleChange}
                      maxLength="10" className="w-full border rounded px-3 py-2" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Email ID *</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange}
                      className="w-full border rounded px-3 py-2" />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Emergency Contact Name</label>
                    <input type="text" name="emergencyContactName" value={formData.emergencyContactName} onChange={handleChange}
                      className="w-full border rounded px-3 py-2" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Emergency Contact Number</label>
                    <input type="text" name="emergencyContactNumber" value={formData.emergencyContactNumber} onChange={handleChange}
                      maxLength="10" className="w-full border rounded px-3 py-2" />
                    {errors.emergencyContactNumber && <p className="text-red-500 text-xs mt-1">{errors.emergencyContactNumber}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Address Information */}
            {currentStep === 5 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold mb-4">Address Information</h2>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Permanent Address</label>
                    <textarea name="permanentAddress" value={formData.permanentAddress} onChange={handleChange}
                      className="w-full border rounded px-3 py-2" rows="3"></textarea>
                  </div>
                  
                  <div className="flex items-center">
                    <input type="checkbox" name="sameAsPermanent" checked={formData.sameAsPermanent} onChange={handleChange}
                      className="mr-2" />
                    <label className="text-sm font-medium">Same as Permanent Address</label>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Current Address</label>
                    <textarea name="currentAddress" value={formData.currentAddress} onChange={handleChange}
                      className="w-full border rounded px-3 py-2" rows="3"></textarea>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">City</label>
                      <input type="text" name="city" value={formData.city} onChange={handleChange}
                        className="w-full border rounded px-3 py-2" />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">District</label>
                      <input type="text" name="district" value={formData.district} onChange={handleChange}
                        className="w-full border rounded px-3 py-2" />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">State</label>
                      <input type="text" name="state" value={formData.state} onChange={handleChange}
                        className="w-full border rounded px-3 py-2" />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Pincode</label>
                      <input type="text" name="pincode" value={formData.pincode} onChange={handleChange}
                        maxLength="6" className="w-full border rounded px-3 py-2" />
                      {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Country</label>
                      <input type="text" name="country" value={formData.country} onChange={handleChange}
                        className="w-full border rounded px-3 py-2" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 6: Medical Information */}
            {currentStep === 6 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold mb-4">Medical Information</h2>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Medical Conditions</label>
                    <textarea name="medicalConditions" value={formData.medicalConditions} onChange={handleChange}
                      className="w-full border rounded px-3 py-2" rows="3"></textarea>
                  </div>
                  
                  <div className="flex items-center">
                    <input type="checkbox" name="disability" checked={formData.disability} onChange={handleChange}
                      className="mr-2" />
                    <label className="text-sm font-medium">Disability</label>
                  </div>
                  
                  {formData.disability && (
                    <div>
                      <label className="block text-sm font-medium mb-1">Disability Details</label>
                      <textarea name="disabilityDetails" value={formData.disabilityDetails} onChange={handleChange}
                        className="w-full border rounded px-3 py-2" rows="2"></textarea>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Health Insurance Details</label>
                      <input type="text" name="healthInsurance" value={formData.healthInsurance} onChange={handleChange}
                        className="w-full border rounded px-3 py-2" />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Emergency Medical Contact</label>
                      <input type="text" name="emergencyMedicalContact" value={formData.emergencyMedicalContact} onChange={handleChange}
                        className="w-full border rounded px-3 py-2" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 7: Teaching Details */}
            {currentStep === 7 && formData.designation === 'Teacher' && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold mb-4">Academic & Teaching Related</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <input type="checkbox" name="classIncharge" checked={formData.classIncharge} onChange={handleChange}
                      className="mr-2" />
                    <label className="text-sm font-medium">Class Incharge</label>
                  </div>
                  
                  <div className="flex items-center">
                    <input type="checkbox" name="isHOD" checked={formData.isHOD} onChange={handleChange}
                      className="mr-2" />
                    <label className="text-sm font-medium">HOD</label>
                  </div>
                  
                  <div className="flex items-center">
                    <input type="checkbox" name="timetableAssigned" checked={formData.timetableAssigned} onChange={handleChange}
                      className="mr-2" />
                    <label className="text-sm font-medium">Timetable Assigned</label>
                  </div>
                  
                  <div className="flex items-center">
                    <input type="checkbox" name="labIncharge" checked={formData.labIncharge} onChange={handleChange}
                      className="mr-2" />
                    <label className="text-sm font-medium">Lab Incharge</label>
                  </div>
                </div>
              </div>
            )}
            
            {currentStep === 7 && formData.designation !== 'Teacher' && (
              <div className="text-center py-8">
                <p className="text-gray-600">Teaching details are only applicable for Teachers</p>
              </div>
            )}

            {/* Step 8: Accommodation */}
            {currentStep === 8 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold mb-4">Hostel / Accommodation</h2>
                <div className="flex items-center mb-4">
                  <input type="checkbox" name="accommodationRequired" checked={formData.accommodationRequired} onChange={handleChange}
                    className="mr-2" />
                  <label className="text-sm font-medium">Accommodation Required</label>
                </div>
                
                {formData.accommodationRequired && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Room Number</label>
                      <input type="text" name="accommodationRoomNumber" value={formData.accommodationRoomNumber} onChange={handleChange}
                        className="w-full border rounded px-3 py-2" />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Block Name</label>
                      <input type="text" name="accommodationBlock" value={formData.accommodationBlock} onChange={handleChange}
                        className="w-full border rounded px-3 py-2" />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Warden Name</label>
                      <input type="text" name="accommodationWardenName" value={formData.accommodationWardenName} onChange={handleChange}
                        className="w-full border rounded px-3 py-2" />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 9: Documents Upload */}
            {currentStep === 9 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold mb-4">Document Upload Section</h2>
                
                <div className="bg-yellow-50 p-4 rounded mb-4">
                  <p className="text-sm text-yellow-800">Accepted formats: PDF, JPG, PNG | Max size: 5MB per file</p>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Aadhaar Card *</label>
                    <input type="file" data-doctype="aadhaarCard" onChange={handleDocumentUpload} accept=".pdf,.jpg,.png"
                      className="w-full border rounded px-3 py-2" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">PAN Card *</label>
                    <input type="file" data-doctype="idProof" onChange={handleDocumentUpload} accept=".pdf,.jpg,.png"
                      className="w-full border rounded px-3 py-2" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Educational Certificates *</label>
                    <input type="file" data-doctype="certification" onChange={handleDocumentUpload} accept=".pdf,.jpg,.png" multiple
                      className="w-full border rounded px-3 py-2" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Experience Certificates</label>
                    <input type="file" data-doctype="experience" onChange={handleDocumentUpload} accept=".pdf,.jpg,.png" multiple
                      className="w-full border rounded px-3 py-2" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Resume / CV *</label>
                    <input type="file" data-doctype="resume" onChange={handleDocumentUpload} accept=".pdf"
                      className="w-full border rounded px-3 py-2" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Other Documents</label>
                    <input type="file" data-doctype="other" onChange={handleDocumentUpload} accept=".pdf,.jpg,.png" multiple
                      className="w-full border rounded px-3 py-2" />
                  </div>
                </div>
                
                {formData.documents.length > 0 && (
                  <div className="mt-4">
                    <h3 className="font-medium mb-2">Uploaded Documents:</h3>
                    <div className="space-y-2">
                      {formData.documents.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                          <span className="text-sm">{doc.name}</span>
                          <button type="button" onClick={() => removeDocument(index)}
                            className="text-red-500 hover:text-red-700">Remove</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 10: System Access */}
            {currentStep === 10 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold mb-4">System / ERP Related</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Username (Email)</label>
                    <input type="text" value={formData.email} readOnly
                      className="w-full border rounded px-3 py-2 bg-gray-100" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Default Password</label>
                    <input type="text" value="staff123" readOnly
                      className="w-full border rounded px-3 py-2 bg-gray-100" />
                    <p className="text-xs text-gray-500 mt-1">Password will be sent via email</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Role</label>
                    <select name="permissionLevel" value={formData.permissionLevel} onChange={handleChange}
                      className="w-full border rounded px-3 py-2">
                      <option value="Staff">Staff</option>
                      <option value="Admin">Admin</option>
                      <option value="Teacher">Teacher</option>
                      <option value="Accountant">Accountant</option>
                      <option value="Librarian">Librarian</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Access Level</label>
                    <select name="loginAccess" value={formData.loginAccess} onChange={handleChange}
                      className="w-full border rounded px-3 py-2">
                      <option value={true}>Full Access</option>
                      <option value={false}>Limited Access</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Account Status</label>
                    <select name="status" value={formData.status} onChange={handleChange}
                      className="w-full border rounded px-3 py-2">
                      <option value="Active">Active</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded mt-4">
                  <h3 className="font-medium text-green-800 mb-2">Review & Submit</h3>
                  <p className="text-sm text-green-700">Please review all information before submitting. Once submitted, the staff member will be added to the system and credentials will be sent via email.</p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <button type="button" onClick={prevStep} disabled={currentStep === 1}
                className="px-6 py-2 bg-gray-300 rounded disabled:opacity-50">
                Previous
              </button>
              <button type="button" onClick={saveDraft}
                className="px-6 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600">
                Save Draft
              </button>
              {currentStep < 10 ? (
                <button type="button" onClick={nextStep}
                  className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Next
                </button>
              ) : (
                <button type="submit" disabled={loading}
                  className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50">
                  {loading ? 'Submitting...' : 'Submit'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
    </div>
    </div>
  );
};

export default AdminAddStaff;

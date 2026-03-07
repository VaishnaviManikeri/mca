const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

const generateExcel = async (admissions) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Admissions');

  // Define columns
  worksheet.columns = [
    { header: 'S.No', key: 'sno', width: 5 },
    { header: 'Submission Date', key: 'submissionDate', width: 20 },
    { header: 'Course Applied', key: 'courseApplied', width: 20 },
    { header: 'Medium', key: 'medium', width: 10 },
    { header: 'Surname', key: 'surname', width: 15 },
    { header: 'First Name', key: 'firstName', width: 15 },
    { header: 'Father\'s Name', key: 'fathersName', width: 20 },
    { header: 'Mother\'s Name', key: 'mothersName', width: 20 },
    { header: 'Date of Birth', key: 'dateOfBirth', width: 15 },
    { header: 'Sex', key: 'sex', width: 8 },
    { header: 'Marital Status', key: 'maritalStatus', width: 12 },
    { header: 'Blood Group', key: 'bloodGroup', width: 10 },
    { header: 'Mother Tongue', key: 'motherTongue', width: 15 },
    { header: 'Nationality', key: 'nationality', width: 12 },
    { header: 'Religion', key: 'religion', width: 12 },
    { header: 'Category', key: 'category', width: 15 },
    { header: 'Aadhar No', key: 'aadharCardNo', width: 20 },
    { header: 'Cast', key: 'cast', width: 15 },
    { header: 'Creamy Layer', key: 'creamyLayer', width: 12 },
    { header: 'Present Address', key: 'presentAddress', width: 30 },
    { header: 'Present Pin', key: 'presentPin', width: 10 },
    { header: 'Permanent Address', key: 'permanentAddress', width: 30 },
    { header: 'Permanent Pin', key: 'permanentPin', width: 10 },
    { header: 'Student Contact', key: 'studentContact', width: 15 },
    { header: 'Phone 1', key: 'phone1', width: 15 },
    { header: 'Phone 2', key: 'phone2', width: 15 },
    { header: 'Email', key: 'emailId', width: 25 },
    { header: 'Subjects Offered', key: 'subjectsOffered', width: 20 },
    { header: 'Last College', key: 'lastCollegeName', width: 25 },
    { header: '10th %', key: 'tenthPercentage', width: 10 },
    { header: '12th %', key: 'twelfthPercentage', width: 10 },
    { header: 'Graduation %', key: 'gradPercentage', width: 10 }
  ];

  // Style header row
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };

  // Add data rows
  admissions.forEach((admission, index) => {
    // Find percentages from academic records
    const tenthRecord = admission.academicRecords?.find(r => r.examination?.toLowerCase().includes('10th') || r.srNo === 1);
    const twelfthRecord = admission.academicRecords?.find(r => r.examination?.toLowerCase().includes('12th') || r.srNo === 2);
    const gradRecord = admission.academicRecords?.find(r => r.examination?.toLowerCase().includes('grad') || r.srNo === 3);

    worksheet.addRow({
      sno: index + 1,
      submissionDate: new Date(admission.submittedAt).toLocaleDateString(),
      courseApplied: admission.courseApplied,
      medium: admission.medium,
      surname: admission.surname,
      firstName: admission.firstName,
      fathersName: admission.fathersName,
      mothersName: admission.mothersName,
      dateOfBirth: admission.dateOfBirth ? new Date(admission.dateOfBirth).toLocaleDateString() : '',
      sex: admission.sex,
      maritalStatus: admission.maritalStatus,
      bloodGroup: admission.bloodGroup,
      motherTongue: admission.motherTongue,
      nationality: admission.nationality,
      religion: admission.religion,
      category: admission.category,
      aadharCardNo: admission.aadharCardNo,
      cast: admission.cast,
      creamyLayer: admission.creamyLayer,
      presentAddress: admission.presentAddress,
      presentPin: admission.presentPin,
      permanentAddress: admission.permanentAddress,
      permanentPin: admission.permanentPin,
      studentContact: admission.studentContact,
      phone1: admission.phone1,
      phone2: admission.phone2,
      emailId: admission.emailId,
      subjectsOffered: admission.subjectsOffered,
      lastCollegeName: admission.lastCollegeName,
      tenthPercentage: tenthRecord?.percentage || '',
      twelfthPercentage: twelfthRecord?.percentage || '',
      gradPercentage: gradRecord?.percentage || ''
    });
  });

  // Generate file path
  const filePath = path.join(__dirname, '../uploads/admission.xlsx');
  
  // Ensure directory exists
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Write to file
  await workbook.xlsx.writeFile(filePath);
  
  return filePath;
};

module.exports = { generateExcel };
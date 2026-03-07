const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

const writeToExcel = async (admissionData, filePath = null, generateFull = false) => {
  const workbook = new ExcelJS.Workbook();
  const uploadsDir = path.join(__dirname, '../uploads');
  const excelPath = filePath || path.join(uploadsDir, 'admission.xlsx');

  let worksheet;

  // Check if file exists and we're not generating full file
  if (fs.existsSync(excelPath) && !generateFull) {
    await workbook.xlsx.readFile(excelPath);
    worksheet = workbook.getWorksheet('Admissions');
  } else {
    // Create new workbook
    worksheet = workbook.addWorksheet('Admissions');

    // Define columns
    worksheet.columns = [
      { header: 'Sr No', key: 'srNo', width: 10 },
      { header: 'Submission Date', key: 'submittedAt', width: 20 },
      { header: 'Course Applied', key: 'courseAppliedFor', width: 20 },
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
      { header: 'Nationality', key: 'nationality', width: 15 },
      { header: 'Religion', key: 'religion', width: 15 },
      { header: 'Aadhar No', key: 'aadharCardNo', width: 20 },
      { header: 'Cast', key: 'cast', width: 15 },
      { header: 'Category', key: 'category', width: 10 },
      { header: 'Creamy Layer', key: 'creamyLayer', width: 12 },
      { header: 'Present Address', key: 'presentAddress', width: 30 },
      { header: 'Present PIN', key: 'presentPin', width: 10 },
      { header: 'Permanent Address', key: 'permanentAddress', width: 30 },
      { header: 'Permanent PIN', key: 'permanentPin', width: 10 },
      { header: 'Student Contact', key: 'studentContact', width: 15 },
      { header: 'Phone 1', key: 'phone1', width: 15 },
      { header: 'Phone 2', key: 'phone2', width: 15 },
      { header: 'Email', key: 'emailId', width: 25 },
      { header: 'Last College', key: 'lastCollegeName', width: 25 },
      { header: '10th %', key: 'tenthPercentage', width: 10 },
      { header: '12th %', key: 'twelfthPercentage', width: 10 },
      { header: 'Graduation %', key: 'gradPercentage', width: 10 },
      { header: 'IP Address', key: 'ipAddress', width: 20 }
    ];

    // Style the header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4CAF50' }
    };
  }

  if (generateFull) {
    // Clear existing rows if generating full file
    worksheet.spliceRows(2, worksheet.rowCount - 1);
    
    // Add all admissions
    if (Array.isArray(admissionData)) {
      admissionData.forEach((admission, index) => {
        addAdmissionRow(worksheet, admission, index + 1);
      });
    }
  } else {
    // Add single admission
    const srNo = worksheet.rowCount;
    addAdmissionRow(worksheet, admissionData, srNo);
  }

  // Save the workbook
  await workbook.xlsx.writeFile(excelPath);
  return excelPath;
};

const addAdmissionRow = (worksheet, admission, srNo) => {
  // Extract percentages from academic records
  const academicRecords = admission.academicRecords || [];
  const tenthRecord = academicRecords.find(r => r.examination?.includes('10')) || {};
  const twelfthRecord = academicRecords.find(r => r.examination?.includes('12')) || {};
  const gradRecord = academicRecords.find(r => r.examination?.includes('Graduation')) || {};

  worksheet.addRow({
    srNo,
    submittedAt: admission.submittedAt ? new Date(admission.submittedAt).toLocaleDateString() : '',
    courseAppliedFor: admission.courseAppliedFor || '',
    medium: admission.medium || '',
    surname: admission.surname || '',
    firstName: admission.firstName || '',
    fathersName: admission.fathersName || '',
    mothersName: admission.mothersName || '',
    dateOfBirth: admission.dateOfBirth ? new Date(admission.dateOfBirth).toLocaleDateString() : '',
    sex: admission.sex || '',
    maritalStatus: admission.maritalStatus || '',
    bloodGroup: admission.bloodGroup || '',
    motherTongue: admission.motherTongue || '',
    nationality: admission.nationality || '',
    religion: admission.religion || '',
    aadharCardNo: admission.aadharCardNo || '',
    cast: admission.cast || '',
    category: admission.category || '',
    creamyLayer: admission.creamyLayer || '',
    presentAddress: admission.presentAddress || '',
    presentPin: admission.presentPin || '',
    permanentAddress: admission.permanentAddress || '',
    permanentPin: admission.permanentPin || '',
    studentContact: admission.studentContact || '',
    phone1: admission.phone1 || '',
    phone2: admission.phone2 || '',
    emailId: admission.emailId || '',
    lastCollegeName: admission.lastCollegeName || '',
    tenthPercentage: tenthRecord.percentage || '',
    twelfthPercentage: twelfthRecord.percentage || '',
    gradPercentage: gradRecord.percentage || '',
    ipAddress: admission.ipAddress || ''
  });
};

module.exports = { writeToExcel };
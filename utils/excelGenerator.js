const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

const writeToExcel = async (admissionData, returnPath = false) => {
  const filePath = path.join(__dirname, '../uploads/admission.xlsx');
  
  let workbook;
  let worksheet;

  try {
    // Try to load existing workbook
    if (fs.existsSync(filePath)) {
      workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filePath);
      worksheet = workbook.getWorksheet(1);
    } else {
      // Create new workbook with headers
      workbook = new ExcelJS.Workbook();
      worksheet = workbook.addWorksheet('Admissions');

      // Define headers
      const headers = [
        'S.No', 'Submission Date', 'Academic Year', 'Course Applied', 'Medium',
        'Surname', 'First Name', 'Father Name', 'Name in Devnagari', 'Mother Name',
        'Sex', 'Name Change', 'Date of Birth', 'Marital Status', 'Blood Group',
        'Mother Tongue', 'Nationality', 'Religion', 'Maharashtrian', 'Aadhar No',
        'Cast', 'Category', 'Creamy Layer', 'Other Languages', 'Present Address',
        'Present Pin', 'Permanent Address', 'Permanent Pin', 'Student Contact',
        'Phone 1', 'Phone 2', 'Email ID', 'Subjects Offered', 'Last College Name',
        'Last College Address', 'Academic Records', 'Applicant Signature',
        'Parent Signature', 'Application Date', 'IP Address'
      ];

      worksheet.addRow(headers);
      
      // Style headers
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };
    }

    // Handle single admission or array of admissions
    const admissions = Array.isArray(admissionData) ? admissionData : [admissionData];

    for (const admission of admissions) {
      // Format academic records as string
      let academicRecordsStr = '';
      if (admission.academicRecords && admission.academicRecords.length > 0) {
        academicRecordsStr = admission.academicRecords.map(record => 
          `${record.examination}: ${record.boardUniversity} (${record.yearOfPassing}) - ${record.percentage}%`
        ).join('; ');
      }

      // Get next row number
      const rowNumber = worksheet.rowCount + 1;

      // Add data row
      worksheet.addRow([
        rowNumber - 1, // S.No
        admission.submittedAt ? new Date(admission.submittedAt).toLocaleString() : '',
        admission.academicYear ? `${admission.academicYear.start}-${admission.academicYear.end}` : '',
        admission.courseApplied || '',
        admission.medium || '',
        admission.surname || '',
        admission.firstName || '',
        admission.fatherName || '',
        admission.nameInDevnagari || '',
        admission.motherName || '',
        admission.sex || '',
        admission.nameChange || '',
        admission.dateOfBirth ? new Date(admission.dateOfBirth).toLocaleDateString() : '',
        admission.maritalStatus || '',
        admission.bloodGroup || '',
        admission.motherTongue || '',
        admission.nationality || '',
        admission.religion || '',
        admission.maharashtrian || '',
        admission.aadharCardNo || '',
        admission.cast || '',
        admission.category || '',
        admission.creamyLayer || '',
        admission.otherLanguages || '',
        admission.presentAddress || '',
        admission.presentAddressPin || '',
        admission.permanentAddress || '',
        admission.permanentAddressPin || '',
        admission.studentContact || '',
        admission.phone1 || '',
        admission.phone2 || '',
        admission.emailId || '',
        admission.subjectsOffered || '',
        admission.lastCollegeName || '',
        admission.lastCollegeAddress || '',
        academicRecordsStr,
        admission.applicantSignature || '',
        admission.parentSignature || '',
        admission.applicationDate ? new Date(admission.applicationDate).toLocaleDateString() : '',
        admission.ipAddress || ''
      ]);
    }

    // Auto-fit columns
    worksheet.columns.forEach(column => {
      column.width = 20;
    });

    // Save workbook
    await workbook.xlsx.writeFile(filePath);

    if (returnPath) {
      return filePath;
    }
    return true;
  } catch (error) {
    console.error('Excel generation error:', error);
    throw error;
  }
};

module.exports = { writeToExcel };
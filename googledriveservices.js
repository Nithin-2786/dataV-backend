const { google } = require('googleapis');
const { Readable } = require('stream');
const KEYFILEPATH = './service.json';
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILEPATH,
  scopes: SCOPES,
});

const drive = google.drive({ version: 'v3', auth });
const uploadFile = async (fileStream, fileName) => {
  try {
    const fileMetaData = {
      name: fileName,
      parents: ['10PIt_kIlFquufb2IkPkEfD4KZPEExEEK'] // Folder ID
    };

    const media = {
      mimeType: 'application/octet-stream',
      body: fileStream,
    };

    const response = await drive.files.create({
      resource: fileMetaData,
      media: media,
      fields: 'id',
    });

    const fileId = response.data.id;
    console.log("File Id: ", fileId);

    await drive.permissions.create({
      resource: {
        type: 'user',
        role: 'writer',
        emailAddress: 'lingalajayareddy@gmail.com', // Email of the Google account
      },
      fileId: fileId,
      fields: 'id',
    });

    return fileId; // Return the file ID
  } catch (error) {
    console.error('Error uploading file to Google Drive:', error);
    throw error;
  }
};
const getFileFromDrive = async (fileId) => {
  try {
    const response = await drive.files.get({
      fileId: fileId,
      alt: 'media',
    }, {
      responseType: 'stream',
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching file from Google Drive:', error);
    throw error;
  }
};

module.exports = {
  getFileFromDrive,
  uploadFile,
};

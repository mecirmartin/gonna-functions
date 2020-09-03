const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert({
    type: 'service_account',
    project_id: 'project-1-6da20',
    private_key_id: '82cb1ebebd0b011f5f269328f07345c14ec46d0a',
    private_key:
      '-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC3stGmkpF9t6+g\nChWrJeg6hq+ECgQujyBVnIDLmL9/I95WyBg9z/Q5dDtMx3iDkE8LbtmN4SBoaMzB\nKB9b9K2dqJeAhrzZ1NiUULuWdDEztInL0DgObCGPj1U9AMPJjl8fvPlq6/ch9shc\nMuit1KvSaYtP5sKMMoYLvPGXDAehwYgANrzADDKPCyX7llC+ZSLYOiOGVjvSP8Yi\n0TZn9Q1c7EeMHhAkdacjDcCsRzClbfHBr87pDOCNeBzvt4G6haDtfY419B1++019\nmOqMMhTDu1OnIZyoaYciPC+HAH49jMCkWkRSIuVCiGLmwEZpS/O8/cnlcYV1fAjV\nAzw0kK4VAgMBAAECggEABu8/LtSVnXNTs+ztiHpz29G9ynQ+WCubAuBXlFf90qTd\n/dSr5Zl2FL0oh+t3xy+pbDsRB2QaPxbFs/z5whTogO0eWwG7G1YHnwG1MybLvLHy\nCbmghBrc4Xh9tUHUIkW3nZEasUibGbMhOSnK0tUWb2kAk1GYwoYdvU+ypwsTNq3x\nI+Xl5QgevThWnOyOscLY333s3NVCquPJt0wa06DhWG/ue3ygfqA9KKhv5VNomnZA\nalYDKuHOLLWzqkYm/F9RVsJw0H02/ilSekt7JKqo6cEFxemeXwqcb9B7Ph721v7k\n6jjB2eVuEEmbLElwuHPf5dCsya3ALs5PwIsV6QX9wQKBgQDy7oucNEpZsnaJGiFj\nRwonPF7wn+7/3mLfh3neeD7KF43pEyqD6/WTgqt+HUn5JnQLiMTQTukmTZLuUWx2\n9CktNL92jzI0oxyt6MJpyfQcmt/CHLoCqF6K324fId5P8sgvzivbY9gk1yd3ILEP\no0MpINd6F9pcJFBF3a0Nw4qriQKBgQDBlI/UtIZ5u1tN5rdmFiKgTsmSOf/PSX53\nxmfjCTKKU4Qlae+eGI3B/pbEwY62KgmJcmgLjCxPaK15H6g/SVSeI42Ar9w/A/xb\nvZydTYqV0H7nH0Qu8AGFAyzyHiCh+4haFfTennuYtr5P8xyPxi4BsP4ZwH8rVDlc\n2afhcaePLQKBgF5/RlVjzcwobI2WWYh5uMxcYn3taJWlVwamd1R/p8UK9ovEhdQ9\nNBDGUplDIWRGffuCnzR8jZr1sAL+L1fyUBYin5upxhjNnjlUAlQOV+PMpt+mNwET\np3sTwI1hqk2lHhPiehLkOs7R1qszT0zK8DQOb2Mx5iHTilozCb8B4m4pAoGAVLRy\nH2wC799ou3S6SYRkEGuJTl/srMKHAVgi+zh6EgcrasepHy+1T+7cACqGDPXmCGu0\nVWE3vmOajMaqc07eJPh/oZDSOgy/b1FP55EXlCiQbwfCaRuCPra+Aw/lzZtn9atn\n48XLZW6JZiiGFe9tEDZnadNOkiIfm55uFHsMC90CgYBfLnB2DgcWCIr8lWTf8U0D\nJtCWRjg88xRDrXOFL09Vh9M/7dh/ymxAmMNtdRBWUELOosFK5041hcbG44LErfW5\nM0ke2wzQdKvICzAhCRIt6v5w6IzFvwH8NzRV0hQtHZBWF9kYSdRwm3KzHki3GyHH\n/JskXacvgsGPCDbts3w4gg==\n-----END PRIVATE KEY-----\n',
    client_email:
      'firebase-adminsdk-v2fa9@project-1-6da20.iam.gserviceaccount.com',
    client_id: '114794207776584984898',
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url:
      'https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-v2fa9%40project-1-6da20.iam.gserviceaccount.com',
  }),
  databaseURL: 'https://project-1-6da20.firebaseio.com',
});

const db = admin.firestore();

module.exports = { admin, db };

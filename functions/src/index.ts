// Import from the v2 SDK modules
import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as nodemailer from "nodemailer";
import { getStorage } from "firebase-admin/storage";

// Initialize the Firebase Admin SDK
admin.initializeApp();

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'qwatdev@gmail.com',
        pass: 'rrcc tqnc xfis bjgk', // IMPORTANT: Use environment variables for credentials in production
    },
});

// Interface for the data sent from your React app
interface CreateNewUserData {
  name: string;
  email: string;
  password?: string;
  role: string;
  organization: string;
}

export const createNewUser = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated",
      "You must be authenticated to create a new user."
    );
  }

  const { name, email, password, role, organization } = request.data as CreateNewUserData;

  if (!name) {
    throw new HttpsError(
      "invalid-argument",
      "Username is a required field."
    );
  }
  if (!password || password.length < 6) {
    throw new HttpsError(
      "invalid-argument",
      "Password is required and must be at least 6 characters long."
    );
  }
  if (!email) {
    throw new HttpsError(
      "invalid-argument",
      "Email is a required field."
    );
  }

  try {
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
      displayName: name,
    });

    await admin.firestore().collection("users").doc(userRecord.uid).set({
      uid: userRecord.uid,
      email: email,
      role: role,
      organization: organization,
      name: name,
      avatar: name.substring(0, 2).toUpperCase(),
      skills: [],
      status: "offline",
      projects: [],
    });

    return { status: "success", uid: userRecord.uid };

  } catch (error: unknown) {
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 'auth/email-already-exists'
    ) {
      throw new HttpsError(
        'already-exists',
        'This email address is already in use by another account.'
      );
    }
    console.error("Error creating new user:", error);
    throw new HttpsError("internal", "An unknown error occurred on the server.");
  }
});

export const sendInvitationEmail = onCall(async (request) => {
  const { email, name } = request.data;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'qwatdev@gmail.com',
      pass: 'rrcc tqnc xfis bjgk', // IMPORTANT: Use environment variables for credentials in production
    },
  });

  const mailOptions = {
    from: 'Qwat Innovations <info@qwatinnovations.com>',
    to: email,
    subject: 'You’re Invited to Join Qwatdril – Powered by Qwat Innovations Private Limited',
    html: `
      <p>Hello ${name},</p>
      <p>You have been invited to join the Qwatdril Project Management Platform, powered by Qwat Innovations Private Limited.</p>
      <p><strong>How to Set Up Your Account:</strong></p>
      <ol>
        <li>Click here to access the platform → <a href="https://qwatdril.qwatinnovations.com">qwatdril.qwatinnovations.com</a></li>
        <li>Go to the Login page.</li>
        <li>Enter your registered email address and click "Forgot Password".</li>
        <li>Create a new password of your choice.</li>
        <li>Use your email and new password to log in.</li>
      </ol>
      <p>Welcome aboard! 🚀</p>
      <br>
      <p>Best Regards,</p>
      <p>Team Qwat Innovations Private Limited</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { status: 'success' };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new HttpsError('internal', 'An unknown error occurred on the server.');
  }
});

/**
 * Deletes a file from Firebase Storage given its download URL.
 * Called from the admin panel when a request is approved or declined.
 */
export const deleteFileFromStorage = onCall(async (request) => {
    // 1. Authentication Check
    if (!request.auth) {
        throw new HttpsError(
            "unauthenticated",
            "You must be authenticated to delete a file."
        );
    }

    const { fileUrl } = request.data;

    // 2. Input Validation
    if (!fileUrl || typeof fileUrl !== 'string') {
        throw new HttpsError(
            "invalid-argument",
            "The function must be called with a 'fileUrl' string argument."
        );
    }

    try {
        // 3. Extract the file path from the URL
        const bucket = getStorage().bucket();
        const decodedUrl = decodeURIComponent(fileUrl);
        const pathRegex = /\/o\/(.+)\?/;
        const match = decodedUrl.match(pathRegex);

        if (!match || match.length < 2) {
            throw new HttpsError("invalid-argument", "Could not parse the file path from the provided URL.");
        }

        const filePath = match[1];
        const file = bucket.file(filePath);

        // 4. Delete the file
        await file.delete();

        console.log(`Successfully deleted ${filePath} from storage.`);
        return { success: true, message: "File deleted successfully." };

    } catch (error: unknown) { // <-- FIX: Changed 'any' to 'unknown'
        console.error("Error deleting file from storage:", error);

        // --- START OF THE FIX ---
        // This is a type guard to safely access properties on the 'error' object
        if (
            error &&
            typeof error === 'object' &&
            'code' in error &&
            error.code === 404
        ) {
            console.warn(`File not found at URL: ${fileUrl}. It may have been deleted already.`);
            return { success: true, message: "File not found, likely already deleted." };
        }
        // --- END OF THE FIX ---

        throw new HttpsError(
            "internal",
            "An unexpected error occurred while trying to delete the file."
        );
    }
});

export const sendNewUserRequestEmail = onCall(async (request) => {
    const { name, email, organization } = request.data;
    const mailOptions = {
        from: 'Qwat Innovations <info@qwatinnovations.com>',
        to: 'info@qwatinnovations.com',
        subject: 'New User Registration Request',
        html: `
            <p>A new user has registered in Qwatdril and is awaiting approval.</p>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Organization:</strong> ${organization}</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return { status: 'success' };
    } catch (error) {
        console.error('Error sending new user request email:', error);
        throw new HttpsError('internal', 'An unknown error occurred on the server.');
    }
});

export const sendApprovalEmail = onCall(async (request) => {
    const { email, name } = request.data;
    const mailOptions = {
        from: 'Qwat Innovations <info@qwatinnovations.com>',
        to: email,
        subject: 'Your Qwatdril Account has been Approved!',
        html: `
            <p>Hello ${name},</p>
            <p>Your request to join Qwatdril has been approved! Your account has been created.</p>
            <p>You can now log in using the email and password you provided during registration.</p>
            <p>Welcome aboard! 🚀</p>
            <br>
            <p>Best Regards,</p>
            <p>Team Qwat Innovations Private Limited</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return { status: 'success' };
    } catch (error) {
        console.error('Error sending approval email:', error);
        throw new HttpsError('internal', 'An unknown error occurred on the server.');
    }
});

export const sendRejectionEmail = onCall(async (request) => {
    const { email, name } = request.data;
    const mailOptions = {
        from: 'Qwat Innovations <info@qwatinnovations.com>',
        to: email,
        subject: 'Update on Your Qwatdril Registration Request',
        html: `
            <p>Hello ${name},</p>
            <p>Thank you for your interest in joining Qwatdril. After reviewing your request, we have determined that it does not meet our criteria at this time.</p>
            <p>We appreciate your understanding.</p>
            <br>
            <p>Best Regards,</p>
            <p>Team Qwat Innovations Private Limited</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return { status: 'success' };
    } catch (error) {
        console.error('Error sending rejection email:', error);
        throw new HttpsError('internal', 'An unknown error occurred on the server.');
    }
});

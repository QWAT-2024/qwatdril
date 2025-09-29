import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "./firebase"; // Ensure this path to your firebase config is correct

// Define the data structure for the function call's payload
interface CreateNewUserData {
  name: string;
  email: string;
  password?: string;
  role: string;
  organization: string;
}

// Define the expected response structure from the function
interface CreateNewUserResult {
  status: string;
  uid: string;
}

const functions = getFunctions(app);

// Create a typed, callable function reference and EXPORT it.
// THE FIX IS HERE: Make sure 'export' is present.
export const createNewUser = httpsCallable<CreateNewUserData, CreateNewUserResult>(
  functions,
  'createNewUser' // This string must match the name of the exported function in your backend (functions/src/index.ts)
);

interface SendInvitationEmailData {
  email: string;
  name: string;
}

export const sendInvitationEmail = httpsCallable<SendInvitationEmailData, void>(
  functions,
  'sendInvitationEmail'
);

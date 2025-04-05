import { firbaseAuth } from "./config";
import {
    signInWithEmailAndPassword,
} from "firebase/auth";

export const doSignInWithEmailAndPassword = (email, password) => {
    return signInWithEmailAndPassword(firbaseAuth, email, password);
};

export const doSignOut = () => {
    return firbaseAuth.signOut();
};
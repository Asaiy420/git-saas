import { initializeApp } from "firebase/app";
import {
	getDownloadURL,
	getStorage,
	ref,
	uploadBytesResumable,
} from "firebase/storage";

const firebaseConfig = {
	apiKey: process.env.FIREBASE_API_KEY!,
	authDomain: "git-saas-bddb1.firebaseapp.com",
	projectId: "git-saas-bddb1",
	storageBucket: "git-saas-bddb1.firebasestorage.app",
	messagingSenderId: "670979883750",
	appId: "1:670979883750:web:1582cb0a031fdaed293127",
	measurementId: "G-JRGH6J3T75",
};

const app = initializeApp(firebaseConfig);

export const storage = getStorage(app);

export async function uploadFile(
	file: File,
	setProgress?: (progress: number) => void,
) {
	return new Promise((resolve, reject) => {
		try {
			const storageRef = ref(storage, file.name);
			const uploadTask = uploadBytesResumable(storageRef, file);
			uploadTask.on(
				"state_changed",
				(snapshot) => {
					const progress = Math.round(
						(snapshot.bytesTransferred | snapshot.totalBytes) * 100,
					);
					if (setProgress) setProgress(progress);
					switch (snapshot.state) {
						case "paused":
							console.log("Upload has been paused.");
							break;
						case "running":
							console.log("Upload is running");
							break;
					}
				},
				(error) => {
					reject(error);
				},
				() => {
					getDownloadURL(uploadTask.snapshot.ref).then(
						(downloadUrl) => {
							resolve(downloadUrl as string);
						},
					);
				},
			);
		} catch (e) {
			console.error(e);
			reject(e);
		}
	});
}

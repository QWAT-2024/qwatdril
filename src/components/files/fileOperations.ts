import { collection, addDoc, updateDoc, doc, deleteDoc, writeBatch, query, where, getDocs } from 'firebase/firestore';
import { getStorage, ref, deleteObject } from 'firebase/storage';
import { db } from '../../firebase/firebase';

const storage = getStorage();

// --- Recursive Helpers ---

const updateChildrenPathsRecursive = async (oldPath: string, newPath: string, organization: string, batch: any) => {
    const subfoldersQuery = query(collection(db, "folders"), where("organization", "==", organization), where("path", "==", oldPath));
    const subfoldersSnapshot = await getDocs(subfoldersQuery);
    for (const subfolderDoc of subfoldersSnapshot.docs) {
        const subfolderData = subfolderDoc.data();
        batch.update(doc(db, "folders", subfolderDoc.id), { path: newPath });
        await updateChildrenPathsRecursive(`${oldPath}/${subfolderData.name}`, `${newPath}/${subfolderData.name}`, organization, batch);
    }

    const filesQuery = query(collection(db, "files"), where("organization", "==", organization), where("path", "==", oldPath));
    const filesSnapshot = await getDocs(filesQuery);
    filesSnapshot.forEach(fileDoc => batch.update(doc(db, "files", fileDoc.id), { path: newPath }));
};

const deleteFolderRecursive = async (folder: any, organization: string) => {
    const batch = writeBatch(db);
    
    async function recurse(currentPath: string) {
        const filesQuery = query(collection(db, "files"), where("organization", "==", organization), where("path", "==", currentPath));
        const filesSnapshot = await getDocs(filesQuery);
        for (const fileDoc of filesSnapshot.docs) {
            const fileData = fileDoc.data();
            if (fileData.url) {
                await deleteObject(ref(storage, fileData.url)).catch(err => console.error("Storage delete error:", err));
            }
            batch.delete(doc(db, "files", fileDoc.id));
        }

        const subfoldersQuery = query(collection(db, "folders"), where("organization", "==", organization), where("path", "==", currentPath));
        const subfoldersSnapshot = await getDocs(subfoldersQuery);
        for (const subfolderDoc of subfoldersSnapshot.docs) {
            batch.delete(doc(db, "folders", subfolderDoc.id));
            await recurse(`${currentPath}/${subfolderDoc.data().name}`);
        }
    }

    await recurse(`${folder.path}/${folder.name}`);
    batch.delete(doc(db, "folders", folder.id));
    await batch.commit();
};

const copyFolderRecursive = async (item: any, newPath: string, organization: string, batch: any) => {
    const newFolderData = { ...item, path: newPath, createdAt: new Date() };
    delete newFolderData.id;
    batch.set(doc(collection(db, "folders")), newFolderData);

    const sourcePath = `${item.path}/${item.name}`;
    const destPath = `${newPath}/${item.name}`;

    const filesQuery = query(collection(db, "files"), where("organization", "==", organization), where("path", "==", sourcePath));
    const filesSnapshot = await getDocs(filesQuery);
    filesSnapshot.forEach(fileDoc => {
        const newFileData = { ...fileDoc.data(), path: destPath, createdAt: new Date() };
        batch.set(doc(collection(db, "files")), newFileData);
    });
    
    const subfoldersQuery = query(collection(db, "folders"), where("organization", "==", organization), where("path", "==", sourcePath));
    const subfoldersSnapshot = await getDocs(subfoldersQuery);
    for (const subfolderDoc of subfoldersSnapshot.docs) {
        await copyFolderRecursive({ ...subfolderDoc.data(), id: subfolderDoc.id }, destPath, organization, batch);
    }
};

// --- Exported Functions ---

export const copyItem = async (item: any, newPath: string, organization: string) => {
    if (item.isFolder) {
        const batch = writeBatch(db);
        await copyFolderRecursive(item, newPath, organization, batch);
        await batch.commit();
    } else {
        const { id, ...itemData } = item;
        const newItem = { ...itemData, path: newPath, createdAt: new Date() };
        await addDoc(collection(db, 'files'), newItem);
    }
};

export const moveItem = async (item: any, newPath: string, organization: string) => {
    const collectionName = item.isFolder ? 'folders' : 'files';
    const docRef = doc(db, collectionName, item.id);

    if (item.isFolder) {
        const batch = writeBatch(db);
        const oldPath = `${item.path}/${item.name}`;
        
        batch.update(docRef, { path: newPath });
        await updateChildrenPathsRecursive(oldPath, `${newPath}/${item.name}`, organization, batch);
        await batch.commit();
    } else {
        await updateDoc(docRef, { path: newPath });
    }
};

export const renameItem = async (item: any, newName: string, organization: string) => {
    const collectionName = item.isFolder ? 'folders' : 'files';
    const docRef = doc(db, collectionName, item.id);

    if (item.isFolder) {
        const batch = writeBatch(db);
        const oldPath = `${item.path}/${item.name}`;
        const newPath = `${item.path}/${newName}`;
        
        batch.update(docRef, { name: newName });
        await updateChildrenPathsRecursive(oldPath, newPath, organization, batch);
        await batch.commit();
    } else {
        await updateDoc(docRef, { name: newName });
    }
};

export const deleteItem = async (item: any, organization: string) => {
    if (item.isFolder) {
        await deleteFolderRecursive(item, organization);
    } else {
        if (item.url) {
            await deleteObject(ref(storage, item.url)).catch(console.error);
        }
        await deleteDoc(doc(db, "files", item.id));
    }
};

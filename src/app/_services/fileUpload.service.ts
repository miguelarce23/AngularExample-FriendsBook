import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FileSaver } from 'file-saver';

@Injectable({ providedIn: 'root' })
export class FileUploadService {
    apiUrl : string = 'https://nodejs-fb-app.herokuapp.com';

    constructor(private http: HttpClient) { }

    uploadPhoto(formData: FormData) {
        return this.http.post<any>(`${this.apiUrl}/files/uploadfile`, formData);
    }

    getPhotoBlobById(id: string) {
        return this.http.get(`${this.apiUrl}/files/${id}`, { responseType: "blob" });
    }
    getPhotoById(id: string){
        this.getPhotoBlobById(id)
        .subscribe(
            data => {
                var filename = id + ".img";
                FileSaver.saveAs(data, filename);
            },
            error => {
               
            });
    }
}
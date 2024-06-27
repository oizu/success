import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {error} from "@angular/compiler-cli/src/transformers/util";
import {xor} from "three/examples/jsm/nodes/math/OperatorNode";

@Injectable({
  providedIn: 'root',
})
export class StorageService {

  constructor(private http: HttpClient) {
  }

  private xor(a: string, b: string): string {
    let result = '';
    const maxLength = Math.max(a.length, b.length);
    for (let i = 0; i < maxLength; i++) {
      const charCodeA = i < a.length ? a.charCodeAt(i) : 0;
      const charCodeB = i < b.length ? b.charCodeAt(i) : 0;
      const xorCharCode = charCodeA ^ charCodeB;
      result += String.fromCharCode(xorCharCode);
    }
    return result;
  }

  public get_model(name: string, version?: string) {
   return this.http.get(`/storage/model?model_name=${name}`, {responseType: 'text'});
  }
}

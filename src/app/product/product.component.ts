import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  OnChanges,
  ChangeDetectionStrategy
} from "@angular/core";
import {
  FormBuilder,
  Validators,
  FormGroup,
  ValidatorFn,
  AbstractControl,
  FormArray
} from "@angular/forms";
import { ClrWizard } from "@clr/angular";
import pick from "lodash/pick";

import { IProduct } from "./../products.service";

export function minDateValidation(date: Date): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const forbidden = new Date(control.value) < date;
    return forbidden ? { minDateValidation: { value: control.value } } : null;
  };
}

@Component({
  selector: "app-product",
  templateUrl: "./product.component.html",
  styleUrls: ["./product.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductComponent implements OnInit, OnChanges {
  @ViewChild("productWizard") productWizard: ClrWizard;

  @Input() product: IProduct;
  @Output() finish = new EventEmitter();
  productForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.productForm = fb.group({
      basic: fb.group({
        name: ["", Validators.required],
        description: "",
        price: "",
        active: false,
        features: fb.array([fb.control("")])
      }),
      expiration: fb.group({
        expirationDate: [
          null,
          Validators.compose([
            Validators.required,
            minDateValidation(new Date())
          ])
        ]
      })
    });
  }

  ngOnInit() {
    if (this.product) {
      this.productForm.setValue({
        basic: {
          ...pick(this.product, ["name", "description", "price", "active"]),
          features: this.product.features || [""]
        },
        expiration: {
          ...pick(this.product, ["expirationDate"])
        }
      });
    }
  }

  ngOnChanges() {
    this.ngOnInit();
  }

  get isBasicInvalid(): boolean {
    return this.productForm.get("basic").invalid;
  }

  get isExpirationInvalid(): boolean {
    return this.productForm.get("expiration").invalid;
  }

  get showNameRequiredError() {
    return (
      this.productForm.get("basic.name").hasError("required") &&
      !this.productForm.get("basic.name").pristine
    );
  }

  handleClose() {
    this.finish.emit();
    this.close();
  }

  close() {
    this.productForm.reset();
    this.productWizard.goTo(this.productWizard.pageCollection.pages.first.id);
    this.productWizard.reset();
  }

  handleFinish() {
    this.finish.emit({
      product: {
        id: 222111,
        productImage: this.imageUrl,
        ...this.productForm.get("basic").value,
        ...this.productForm.get("expiration").value
      }
    });
    this.close();
  }
  fileToUpload: any;
  imageUrl: any;
  handleFileInput(file: FileList) {
    this.fileToUpload = file.item(0);

    //Show image preview
    let reader = new FileReader();
    reader.onload = (event: any) => {
      this.imageUrl = event.target.result;
      // localStorage.setItem("imageUrl", this.imageUrl);
    };
    reader.readAsDataURL(this.fileToUpload);
  }
}

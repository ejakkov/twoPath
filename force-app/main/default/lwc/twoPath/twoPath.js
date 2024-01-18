import { LightningElement, api, wire, track } from 'lwc';
import { getRecord, getFieldValue, updateRecord } from 'lightning/uiRecordApi';
import { getPicklistValuesByRecordType } from 'lightning/uiObjectInfoApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

var RECORDTYPE_ID = '012000000000000AAA';
export default class twoPath extends LightningElement {
    @api recordId;

    @api object1ApiName;
    @api object1FieldName;
    @api object1RecordId;
    @api object1CurrentValue;
    @api object1RecordTypeName;
    @api object1LookupFieldApiName;

    @api object2ApiName;
    @api object2FieldName;
    @api object2RecordId;
    @api object2CurrentValue;
    @api object2RecordTypeName;
    @api object2LookupFieldApiName;

    errorMessage;
    showPath1 = true;
    showPath2 = true;
    pathValue = "path";
    recordTypeId;

    @track object1PathValues = [];
    @track object2PathValues = [];

    @track object2LookUpObjectID;
    @track object1LookUpObjectID;
    connectedCallback() {

        if (!this.object1RecordId){
            this.object1RecordId = this.recordId;
        } 
        if (!this.object2RecordId){
           this.object2RecordId = this.recordId; 
        } 

        if(!(this.object1ApiName && this.object1FieldName)) this.showPath1 = false;
        if(!(this.object2ApiName && this.object2FieldName)) this.showPath2 = false;

    }

    object1RecordExecuted = false;
    object2RecordExecuted = false;

    @wire(getRecord, { recordId: '$object1RecordId', layoutTypes: ["Full"], modes: ["View"] }) 
    getObject1FieldValue({error, data}){
        if(data){
            let fieldValue    = getFieldValue(data, data.apiName+'.'+this.object1FieldName);
            this.recordTypeId = getFieldValue(data, this.object1ApiName+'.RecordTypeId');

            if(this.object1LookupFieldApiName){
                let lookUpFieldValue = getFieldValue(data, this.object1ApiName + '.' + this.object1LookupFieldApiName);
                this.recordTypeId = getFieldValue(data, this.object1ApiName + '.RecordTypeId');
                this.object1LookUpObjectID = lookUpFieldValue;
                // Set the flag to indicate that object2Record has been executed
                this.object1RecordExecuted = true;
            }

            this.object1CurrentValue = fieldValue;
            if(this.recordTypeId){
                //RECORDTYPE_ID = this.recordTypeId;
            }else{
                this.recordTypeId = RECORDTYPE_ID;
            }
        }else if(error){
            this.showPath1 = false;
        }
    };

    @wire(getRecord, { recordId: "$object1LookUpObjectID", layoutTypes: ["Full"], modes: ["View"] })
    object1RelatedRecord({ error, data }){
        if (data && this.object1RecordExecuted){
            this.object1ApiName = data.apiName;
            this.object1RecordId = this.object1LookUpObjectID;
            this.object1LookupFieldApiName = false;
        } else if(error){
            console.error("Error object1RelatedRecord", error);
        }
    }

    @wire(getPicklistValuesByRecordType, {objectApiName: '$object1ApiName', recordTypeId: '$recordTypeId'  })
    object1Values({ data, error }) {
        if (data && this.object1FieldName) {
            let allValues = data.picklistFieldValues[this.object1FieldName];
                    this.object1PathValues = [];
                    if(allValues){
                       allValues.values.forEach(option  => {
                        this.object1PathValues.push({
                            label : option.label,
                            value : option.value
                        });

                    }); 
                    }
            };
        if (error) {
            this.showPath1 = false;
        }
    }    

    path1HandleSelectChange(event){
        event.preventDefault();
        this.object1CurrentValue = event.target.value;
        if(!this.showButton){
            const changeEvent = new CustomEvent('change', {
                detail: {
                    value : this.object1CurrentValue
                }
            });
            this.dispatchEvent(changeEvent);
        }
    }

    path1HandleClick(event){
        event.preventDefault();
        const fields = {};
        fields['Id'] = this.object1RecordId; 
        fields[this.object1FieldName] = this.object1CurrentValue; 
        const recordInput = { fields };
        updateRecord(recordInput)
        .then(() => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Record updated',
                    variant: 'success'
                })
            );
        })
        .catch(error => {
            console.error(' Error updating record ', error);
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error updating record',
                    message: error.body.message,
                    variant: 'error'
                })
            );
        })

    }

    @wire(getRecord, { recordId: '$object2RecordId', layoutTypes: ["Full"], modes: ["View"] }) 
    getObject2FieldValue({error, data}){
        if(data && this.object2FieldName){
            let fieldValue    = getFieldValue(data, data.apiName+'.'+this.object2FieldName);
            this.recordTypeId = getFieldValue(data, this.object2ApiName+'.RecordTypeId');
            if(this.object2LookupFieldApiName){
                let lookUpFieldValue = getFieldValue(data, this.object2ApiName + '.' + this.object2LookupFieldApiName);
                this.recordTypeId = getFieldValue(data, this.object2ApiName + '.RecordTypeId');
                this.object2LookUpObjectID = lookUpFieldValue;
                // Set the flag to indicate that object2Record has been executed
                this.object2RecordExecuted = true;
            }
            this.object2CurrentValue = fieldValue;
            
            if(this.recordTypeId){
                //RECORDTYPE_ID = this.recordTypeId;
            }else{
                this.recordTypeId = RECORDTYPE_ID;
            }
        }else if(error){
            this.showPath2 = false;
        }
    };

    @wire(getRecord, { recordId: "$object2LookUpObjectID", layoutTypes: ["Full"], modes: ["View"] })
    object2RelatedRecord({ error, data }){
        if (data && this.object2RecordExecuted){
            this.object2ApiName = data.apiName;
            this.object2RecordId = this.object2LookUpObjectID;
            this.object2LookupFieldApiName = false;
        } else if(error){
            console.error("Error object2RelatedRecord", error);
        }
    }

    @wire(getPicklistValuesByRecordType, {objectApiName: '$object2ApiName', recordTypeId: '$recordTypeId'  })
    object2Values({ data, error }) {
        if (data && this.object2FieldName) {
            let allValues = data.picklistFieldValues[this.object2FieldName];
                    this.object2PathValues = [];
                    if(allValues){
                         allValues.values.forEach(option  => {
                        this.object2PathValues.push({
                            label : option.label,
                            value : option.value
                        });
                    });
                    }
            };
        if (error) {
            this.showPath2 = false;
        }
    }
    
    path2HandleSelectChange(event){
        event.preventDefault();
        this.object2CurrentValue = event.target.value;
        if(!this.showButton){
            const changeEvent = new CustomEvent('change', {
                detail: {
                    value : this.object2CurrentValue
                }
            });
            this.dispatchEvent(changeEvent);
        }
    }

    path2HandleClick(event){
        event.preventDefault();
        const fields = {};
        fields['Id'] = this.object2RecordId; //ID_FIELD.fieldApiName
        fields[this.object2FieldName] = this.object2CurrentValue; // STAGENAME_FIELD.fieldApiName

        const recordInput = { fields };
        updateRecord(recordInput)
        .then(() => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Record updated',
                    variant: 'success'
                })
            );
        })
        .catch(error => {
            console.error(' Error updating record ', error);
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error updating record',
                    message: error.body.message,
                    variant: 'error'
                })
            );
        })

    }
}
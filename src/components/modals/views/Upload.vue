<template>
  <div class="modal-content fm-modal-upload" @dragover.prevent @drop.prevent>
    <div class="modal-header">
      <h5 class="modal-title">{{ lang.modal.upload.title }}</h5>
      <button
        type="button"
        class="close"
        aria-label="Close"
        v-on:click="hideModal"
      >
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <div class="modal-body">
      <div class="fm-btn-wrapper" v-show="!progressBar" @drop="handleFileDrop">
        <div class="dropzone cursor-pointer">
          {{ lang.modal.upload.dropzone.text }}
        </div>
        <input
          type="file"
          multiple
          name="myfile"
          v-on:change="selectFiles($event)"
        />
      </div>
      <div v-if="errorFiles.length > 0" class="alert alert-danger">
        {{ errorMessage }}
      </div>
      <div class="fm-upload-list" v-if="countFiles">
        <div
          class="d-flex justify-content-between"
          v-for="(item, index) in newFiles"
          v-bind:key="index"
        >
          <div class="w-75 text-truncate">
            <i class="far" v-bind:class="mimeToIcon(item.type)" />
            {{ item.name }}
          </div>
          <div class="text-right">
            {{ bytesToHuman(item.size) }}
          </div>
          <div class="text-right cursor-pointer" @click="removeFile(index)">
            <i class="far fa-trash-alt"></i>
          </div>
        </div>
        <hr />
        <div class="d-flex justify-content-between">
          <div>
            <strong>{{ lang.modal.upload.selected }}</strong>
            {{ newFiles.length }}
          </div>
          <div class="text-right">
            <strong>{{ lang.modal.upload.size }}</strong>
            {{ allFilesSize }}
          </div>
        </div>
        <hr />
        <div class="d-flex justify-content-between">
          <div>
            <strong>{{ lang.modal.upload.ifExist }}</strong>
          </div>
          <div class="form-check form-check-inline">
            <input
              class="form-check-input"
              id="uploadRadio1"
              type="radio"
              name="uploadOptions"
              value="0"
              checked
              v-model="overwrite"
            />
            <label class="form-check-label" for="uploadRadio1">
              {{ lang.modal.upload.skip }}
            </label>
          </div>
          <div class="form-check form-check-inline">
            <input
              class="form-check-input"
              id="uploadRadio2"
              type="radio"
              name="uploadOptions"
              value="1"
              checked
              v-model="overwrite"
            />
            <label class="form-check-label" for="uploadRadio2">
              {{ lang.modal.upload.overwrite }}
            </label>
          </div>
        </div>
        <hr />
      </div>
      <div v-else>
        <p>{{ lang.modal.upload.noSelected }}</p>
      </div>
      <div class="fm-upload-info">
        <!-- Progress Bar -->
        <div class="progress" v-show="countFiles">
          <div
            class="progress-bar progress-bar-striped bg-info"
            role="progressbar"
            v-bind:aria-valuenow="progressBar"
            aria-valuemin="0"
            aria-valuemax="100"
            v-bind:style="{ width: progressBar + '%' }"
          >
            {{ progressBar }}%
          </div>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button
        class="btn"
        v-bind:class="[countFiles ? 'btn-info' : 'btn-light']"
        v-bind:disabled="!countFiles"
        v-on:click="uploadFiles"
      >
        {{ lang.btn.submit }}
      </button>
      <button class="btn btn-light" v-on:click="hideModal()">
        {{ lang.btn.cancel }}
      </button>
    </div>
  </div>
</template>

<script>
import modal from "../mixins/modal";
import translate from "../../../mixins/translate";
import helper from "../../../mixins/helper";

export default {
  name: "Upload",
  mixins: [modal, translate, helper],
  data() {
    return {
      // selected files
      newFiles: [],
      errorFiles: [],

      // overwrite if exists
      overwrite: 0
    };
  },
  computed: {
    /**
     * Progress bar value - %
     * @returns {number}
     */
    progressBar() {
      return this.$store.state.fm.messages.actionProgress;
    },

    /**
     * Count of files selected for upload
     * @returns {number}
     */
    countFiles() {
      return this.newFiles.length;
    },

    /**
     * Calculate the size of all files
     * @returns {*|string}
     */
    allFilesSize() {
      let size = 0;

      for (let i = 0; i < this.newFiles.length; i += 1) {
        size += this.newFiles[i].size;
      }

      return this.bytesToHuman(size);
    },

    errorMessage() {
      let message = "";
      if (this.errorFiles.length === 0) return message;

      for (let i = 0; i < this.errorFiles.length; i += 1) {
        message += `"${this.errorFiles[i].name}"`;
        if (i < this.errorFiles.length - 1) {
          message += ", ";
        }
      }

      if (this.errorFiles.length > 1) {
        message += " are";
      } else {
        message += " is";
      }

      return message + " not allowed. Please choose only image or video files.";
    }
  },
  methods: {
    /**
     * Handle files dropped to dropzone
     * @param event
     */
    handleFileDrop(event) {
      this.handleSelectedFiles(event.dataTransfer.files);
    },
    /**
     * Remove file from list
     * @param index
     */
    removeFile(index) {
      if (this.newFiles.length < index) return;

      this.newFiles.splice(index, 1);
    },
    /**
     * Select file or files
     * @param event
     */
    selectFiles(event) {
      this.handleSelectedFiles(event.target.files);
    },
    handleSelectedFiles(files) {
      this.errorFiles = [];

      if (!files) return;
      [...files].forEach(f => {
        if (this.isFileAllowed(f)) {
          this.newFiles.push(f);
        } else {
          this.errorFiles.push(f);
        }
      });
    },
    /**
     * Upload new files
     */
    uploadFiles() {
      // if files exists
      if (this.countFiles) {
        // upload files
        this.$store
          .dispatch("fm/upload", {
            files: this.newFiles,
            overwrite: this.overwrite
          })
          .then(response => {
            // if upload is successful
            if (response.data.result.status === "success") {
              // close modal window
              this.hideModal();
            }
          });
      }
    }
  }
};
</script>

<style lang="scss">
.fm-modal-upload {
  .fm-btn-wrapper {
    position: relative;
    overflow: hidden;
    padding-bottom: 6px;
    margin-bottom: 0.6rem;
    .dropzone {
      height: 100px;
      border: dotted 3px lightgray;
      text-align: center;
      vertical-align: middle;
      line-height: 100px;
      color: gray;
    }
    input[type="file"] {
      font-size: 100px;
      position: absolute;
      left: 0;
      top: 0;
      opacity: 0;
      cursor: pointer;
    }
  }

  .fm-upload-list .far {
    padding-right: 0.5rem;
  }

  .fm-upload-list .form-check-inline {
    margin-right: 0;
  }

  .fm-upload-info > .progress {
    margin-bottom: 1rem;
  }
  .cursor-pointer {
    cursor: pointer;
  }
}
</style>

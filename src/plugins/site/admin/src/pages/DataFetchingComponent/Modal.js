// @ts-nocheck
// Import necessary dependencies
import React, { useState, useEffect } from "react";
import {
  ModalLayout,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Typography,
  Button,
} from "@strapi/design-system";
import {
  useAutoReloadOverlayBlocker,
  useFetchClient,
  useNotification,
} from "@strapi/helper-plugin";
import { useParams } from "react-router-dom";
import { useQueryParams } from "@strapi/helper-plugin";

// Define the Modal component
const Modal = ({ setShowModal }) => {
  const { post } = useFetchClient();
  const [jsonData, setJsonData] = useState(null);
  const siteId = useParams().id;
  const [{ query }] = useQueryParams();
  const [isLoading, setIsLoading] = useState(false);
  const toggleNotification = useNotification();
  const [showPostData, setShowPostData] = useState(true);
  const [selectedContentType, setSelectedContentType] = useState("post");
  const { lockAppWithAutoreload, unlockAppWithAutoreload } =
    useAutoReloadOverlayBlocker();
    const [editedNames, setEditedNames] = useState({
      post: "",
      app: "",
      page: "",
      agency: "",
      attachment: "",
      services: "",
    });

    const handleNameChange = (e, contentType) => {
      const { value } = e.target;
      setEditedNames((prevNames) => ({
        ...prevNames,
        [contentType]: value,
      }));
    };

  // Fetch data when component mounts
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api/sites/${siteId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const data = await response.json();

        // Filter out fields starting with an underscore
        const filterDataTypes = {
          post: filterFields(data?.data?.attributes?.post),
          app: filterFields(data?.data?.attributes?.app),
          page: filterFields(data?.data?.attributes?.page),
          agency: filterFields(data?.data?.attributes?.agency),
          attachment: filterFields(data?.data?.attributes?.attachment),
          services: filterFields(data?.data?.attributes?.services),
        };

        setJsonData(filterDataTypes);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData();
  }, []);

  // Function to handle the click event on content type buttons
  const handleContentTypeButtonClick = (contentType) => {
    setSelectedContentType(contentType);
  };

  // Function to filter fields starting with an underscore
  const filterFields = (data) => {
    if (!data) return null;
    return Object.fromEntries(
      Object.entries(data).filter(
        ([key, value]) =>
          key !== "ID" && !key.startsWith("_") && value !== "taxonomy"
      )
    );
  };

  // Function to handle form submission
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // Lock the app with autoreload blocker
    lockAppWithAutoreload({
      title: "Creating Content Type",
      description: "Please wait...",
      icon: "reload",
    });

    setIsLoading(true);

    try {
      // Get the checked fields for post
      const checkedPost = Object.entries(jsonData.post || {}).reduce(
        (acc, [key]) => {
          const checkbox = document.getElementById(`post_${key}`);
          if (checkbox && checkbox.checked) {
            acc[key] = jsonData.post[key];
          }
          return acc;
        },
        {}
      );

      // Get the checked fields for app
      const checkedApp = Object.entries(jsonData.app || {}).reduce(
        (acc, [key]) => {
          const checkbox = document.getElementById(`app_${key}`);
          if (checkbox && checkbox.checked) {
            acc[key] = jsonData.app[key];
          }
          return acc;
        },
        {}
      );

      // Get the checked fields for page
      const checkedPage = Object.entries(jsonData.page || {}).reduce(
        (acc, [key]) => {
          const checkbox = document.getElementById(`page_${key}`);
          if (checkbox && checkbox.checked) {
            acc[key] = jsonData.page[key];
          }
          return acc;
        },
        {}
      );

      // Get the checked fields for agency
      const checkedAgency = Object.entries(jsonData.agency || {}).reduce(
        (acc, [key]) => {
          const checkbox = document.getElementById(`agency_${key}`);
          if (checkbox && checkbox.checked) {
            acc[key] = jsonData.agency[key];
          }
          return acc;
        },
        {}
      );

      // Get the checked fields for attachment
      const checkedAttachment = Object.entries(
        jsonData.attachment || {}
      ).reduce((acc, [key]) => {
        const checkbox = document.getElementById(`attachment_${key}`);
        if (checkbox && checkbox.checked) {
          acc[key] = jsonData.attachment[key];
        }
        return acc;
      }, {});

      // Get the checked fields for services
      const checkedServices = Object.entries(jsonData.services || {}).reduce(
        (acc, [key]) => {
          const checkbox = document.getElementById(`services_${key}`);
          if (checkbox && checkbox.checked) {
            acc[key] = jsonData.services[key];
          }
          return acc;
        },
        {}
      );

      console.log(
        checkedPost,
        checkedApp,
        checkedPage,
        checkedAgency,
        checkedAttachment,
        checkedServices
      );
      // // Create content types
      // console.log("checkedPost", checkedPost);
      // console.log("checkedApp:", checkedApp);

      const contentTypeAttributes = {
        ...Object.keys(checkedPost || {}).reduce((acc, key) => {
          acc[`${key}`] = {
            type: getType(checkedPost[key], key),
          };
          return acc;
        }, {}),
        ...Object.keys(checkedApp || {}).reduce((acc, key) => {
          acc[`${key}`] = {
            type: getType(checkedApp[key], key),
          };
          return acc;
        }, {}),
        ...Object.keys(checkedPage || {}).reduce((acc, key) => {
          acc[`${key}`] = {
            type: getType(checkedPage[key], key),
          };
          return acc;
        }, {}),
        ...Object.keys(checkedAgency || {}).reduce((acc, key) => {
          acc[`${key}`] = {
            type: getType(checkedAgency[key], key),
          };
          return acc;
        }, {}),
        ...Object.keys(checkedAttachment || {}).reduce((acc, key) => {
          acc[`${key}`] = {
            type: getType(checkedAttachment[key], key),
          };
          return acc;
        }, {}),
        ...Object.keys(checkedServices || {}).reduce((acc, key) => {
          acc[`${key}`] = {
            type: getType(checkedServices[key], key),
          };
          return acc;
        }, {}),
      };

      function getType(value, key) {
        if (["date", "date_gmt", "modified_gmt", "modified"].includes(key)) {
          return "date";
        }
        if (["password"].includes(key)) {
          return "password";
        }
        return "text";
      }
      console.log("contentTypeAttributes:", contentTypeAttributes);

      // Determine the content type based on which checkboxes are checked
      const contentType = (() => {
        if (Object.keys(checkedPost || {}).length > 0) {
          return "post";
        } else if (Object.keys(checkedApp || {}).length > 0) {
          return "app";
        } else if (Object.keys(checkedPage || {}).length > 0) {
          return "page";
        } else if (Object.keys(checkedAgency || {}).length > 0) {
          return "agency";
        } else if (Object.keys(checkedAttachment || {}).length > 0) {
          return "attachment";
        } else if (Object.keys(checkedServices || {}).length > 0) {
          return "services";
        } else {
          return null;
        }
      })();

// Use the determined content type to set appropriate names
const kebabCase = (str) => str.toLowerCase().replace(/\s+/g, "-");

const collectionName = kebabCase(editedNames[contentType] || contentType);
const singularName = kebabCase(editedNames[contentType] || contentType);
const pluralName = kebabCase(editedNames[contentType] || contentType) + "s";
const displayName =
  (editedNames[contentType] || contentType).charAt(0).toUpperCase() +
  (editedNames[contentType] || contentType).slice(1);
const description = displayName;


      try {
        // Create the collection type and store the response status
        const contentTypeResponse = await post(
          "/content-type-builder/content-types",
          {
            contentType: {
              kind: "collectionType",
              collectionName,
              singularName,
              pluralName,
              displayName,
              description,
              draftAndPublish: true,
              info: {},
              options: {},
              pluginOptions: {},
              attributes: contentTypeAttributes,
            },
          }
        );

       // Extract the uid from contentTypeResponse
  const uid = contentTypeResponse?.data?.data?.uid;

  // Store the uid in localStorage
  if (uid) {
    localStorage.setItem("contentTypeUid", uid);
    console.log("Stored contentType uid:", uid);
  } 
      } catch (error) {
        console.error("Error creating content types:", error);
        toggleNotification({
          type: "warning",
          message: `${error.message}`,
        });
      } finally {
        setIsLoading(false);
        unlockAppWithAutoreload();
      }

      if (status === 201) {
        toggleNotification({
          message: "Content types created successfully",
        });
        setShowModal(false);
      }
    } catch (error) {
      console.error("Error creating content types:", error);
      toggleNotification({
        type: "warning",
        message: `${error.message}`,
      });
    } finally {
      setIsLoading(false);
      unlockAppWithAutoreload();
    }
  };

  // Render the modal component
  return (
    <ModalLayout
      onClose={() => setShowModal(false)}
      labelledBy="title"
      as="form"
      onSubmit={handleFormSubmit}
    >
      <ModalHeader>
        <Typography fontWeight="bold" textColor="neutral800" as="h2" id="title">
          Generate Content Type
        </Typography>
      </ModalHeader>
      <ModalBody>
        <div style={{ display: "flex" }}>
          {["post", "app", "page", "agency", "attachment", "services"].map(
            (contentType) => (
              <div key={contentType} style={{ marginRight: "10px" }}>
                <Button
                  onClick={() => handleContentTypeButtonClick(contentType)}
                  variant={
                    contentType === selectedContentType ? "primary" : "secondary"
                  }
                >
                  {contentType.toUpperCase()}
                </Button>
                {selectedContentType === contentType && (
                  <input
                    type="text"
                    placeholder={`Enter ${contentType} name`}
                    value={editedNames[contentType]}
                    onChange={(e) => handleNameChange(e, contentType)}
                  />
                )}
              </div>
            )
          )}
        </div>
        {jsonData ? (
          <>
            <Typography variant="h3" style={{ marginBottom: "10px" }}>
              {selectedContentType.toUpperCase()}
            </Typography>
            {Object.entries(jsonData[selectedContentType] || {}).map(
              ([key, value]) => (
                <div
                  key={`${selectedContentType}_${key}`}
                  style={{ marginBottom: "10px", fontSize: "25px" }}
                >
                  <input
                    type="checkbox"
                    id={`${selectedContentType}_${key}`}
                    name={`${selectedContentType}_${key}`}
                    value={`${selectedContentType}_${key}`}
                    style={{ marginRight: "10px" }}
                  />
                  <label htmlFor={`${selectedContentType}_${key}`}>
                    <span
                      style={{ minWidth: "150px", display: "inline-block" }}
                    >
                      {key}
                    </span>
                    <span
                      style={{ minWidth: "100px", display: "inline-block" }}
                    >
                      ({typeof value})
                    </span>
                  </label>
                </div>
              )
            )}
          </>
        ) : (
          <Typography>Loading...</Typography>
        )}
      </ModalBody>
      <ModalFooter
        startActions={
          <Button onClick={() => setShowModal(false)} variant="tertiary">
            Cancel
          </Button>
        }
        endActions={<Button type="submit">Create Content Type</Button>}
      />
    </ModalLayout>
  );
};

export default Modal;

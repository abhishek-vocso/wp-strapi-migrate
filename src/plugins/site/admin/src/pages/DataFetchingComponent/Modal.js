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
  const { lockAppWithAutoreload, unlockAppWithAutoreload } =
    useAutoReloadOverlayBlocker();

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
          postTypes: filterFields(data?.data?.attributes?.postTypes),
          taxonomies: filterFields(data?.data?.attributes?.taxonomies),
        };

        setJsonData(filterDataTypes);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData();
  }, []);

  // Function to filter fields starting with an underscore
  const filterFields = (data) => {
    if (!data) return null;
    return Object.fromEntries(
      Object.entries(data).filter(
        ([key, value]) => key !== "ID" && !key.startsWith("_") && value !== "taxonomy"
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
      // Get the checked fields for post types
      const checkedPostTypes = Object.entries(jsonData.postTypes || {}).reduce(
        (acc, [key]) => {
          const checkbox = document.getElementById(`post_${key}`);
          if (checkbox && checkbox.checked) {
            acc[key] = jsonData.postTypes[key];
          }
          return acc;
        },
        {}
      );

      // Get the checked fields for taxonomies
      const checkedTaxonomies = Object.entries(
        jsonData.taxonomies || {}
      ).reduce((acc, [key]) => {
        const checkbox = document.getElementById(`taxonomy_${key}`);
        if (checkbox && checkbox.checked) {
          acc[key] = jsonData.taxonomies[key];
        }
        return acc;
      }, {});
     

      console.log(checkedPostTypes, checkedTaxonomies)
      // Create content types
      console.log("checkedPostTypes:", checkedPostTypes);
      console.log("checkedTaxonomies:", checkedTaxonomies);
      
      const contentTypeAttributes = {
        ...Object.keys(checkedPostTypes || {}).reduce((acc, key) => {
          acc[`${key}`] = {
            type: getType(checkedPostTypes[key], key),
          };
          return acc;
        }, {}),
        ...Object.keys(checkedTaxonomies || {}).reduce((acc, key) => {
          acc[`${key}`] = {
            type: getType(checkedTaxonomies[key], key),
          };
          return acc;
        }, {}),
        // Add one-to-one relational field for linking to taxonomies
        taxonomy_relation: {
          type: "relation",
          relation: "oneToOne",
          target: "api::demo1.demo1",
        },
      };
      
      
      
      
      function getType(value, key) {
        if (["date", "date_gmt", "modified_gmt", "modified"].includes(key)) {
          return "date";
        }
        if(["password"].includes(key)){
          return "password";
        }
        return 'text';
      }
      console.log("contentTypeAttributes:", contentTypeAttributes);
      
const isPostType = Object.keys(checkedPostTypes || {}).length > 0;
const isTaxonomy = Object.keys(checkedTaxonomies || {}).length > 0;

const collectionName = isPostType ? "post" : "app";
const singularName = isPostType ? "post" : "app";
const pluralName = (isPostType ? "post" : "app") + "s";
const displayName = isPostType ? "Post" : "App";
const description = isPostType ? "Post" : "App";

const { status } = await post("/content-type-builder/content-types", {
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
});

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
        {jsonData ? (
          <>
            <div style={{ marginBottom: "10px" }}>
              <input
                type="checkbox"
                id="toggleData"
                name="toggleData"
                value="toggleData"
                checked={showPostData}
                onChange={() => setShowPostData(!showPostData)}
                style={{ marginRight: "10px" }}
              />
              <label htmlFor="toggleData">Show {showPostData ? "App" : "Post"} Schema</label>
            </div>
            {showPostData ? (
              <>
                <Typography variant="h3">Post</Typography>
                {Object.entries(jsonData.postTypes || {}).map(([key, value]) => (
                  <div
                    key={`post_${key}`}
                    style={{ marginBottom: "10px", fontSize: "25px" }}
                  >
                    <input
                      type="checkbox"
                      id={`post_${key}`}
                      name={`post_${key}`}
                      value={`post_${key}`}
                      style={{ marginRight: "10px" }}
                    />
                    <label htmlFor={`post_${key}`}>
                      <span style={{ minWidth: "150px", display: "inline-block" }}>
                        {key}
                      </span>
                      <span style={{ minWidth: "100px", display: "inline-block" }}>
                        ({typeof value})
                      </span>
                    </label>
                  </div>
                ))}
                
              </>
            ) : (
              <>
                <Typography variant="h3">App</Typography>
                {Object.entries(jsonData.taxonomies || {}).map(([key, value]) => (
                  <div
                    key={`taxonomy_${key}`}
                    style={{ marginBottom: "10px", fontSize: "25px" }}
                  >
                    <input
                      type="checkbox"
                      id={`taxonomy_${key}`}
                      name={`taxonomy_${key}`}
                      value={`taxonomy_${key}`}
                      style={{ marginRight: "10px" }}
                    />
                    <label htmlFor={`taxonomy_${key}`}>
                      <span style={{ minWidth: "150px", display: "inline-block" }}>
                        {key}
                      </span>
                      <span style={{ minWidth: "100px", display: "inline-block" }}>
                        ({typeof value})
                      </span>
                    </label>
                  </div>
                ))}
              </>
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

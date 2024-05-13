// @ts-nocheck
import React, { useState, useEffect } from "react";
import {
  ModalLayout,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Typography,
  Button,
} from "@strapi/design-system";
import { useFetchClient, useNotification } from "@strapi/helper-plugin";
import { useParams } from "react-router-dom";

const TaxonomyModal = ({ setShowModal }) => {
  const { post } = useFetchClient();
  const siteId = useParams().id;
  const toggleNotification = useNotification();
  const [taxonomyKeys, setTaxonomyKeys] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [taxonomyData, setTaxonomyData] = useState([]);
  const [displayType, setDisplayType] = useState("app"); // Default to displaying app
  const [activeButton, setActiveButton] = useState("app");

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

        // Merge keys from all types
        const allKeysSet = new Set([
          ...Object.keys(filterDataTypes.post),
          ...Object.keys(filterDataTypes.app),
          ...Object.keys(filterDataTypes.page),
          ...Object.keys(filterDataTypes.agency),
          ...Object.keys(filterDataTypes.attachment),
          ...Object.keys(filterDataTypes.services),
        ]);

        // Convert the Set back to an array
        const allKeys = [...allKeysSet];

        // @ts-ignore
        setTaxonomyData(filterDataTypes);
        setTaxonomyKeys(allKeys);
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
        ([key, value]) => key !== "ID" && !key.startsWith("_") && value === "taxonomy"
      ).map(([key, value]) => [key, data[key + "_post_type"]])
    );
  };

  const handleCheckboxChange = (key) => {
    setSelectedKeys((prevSelectedKeys) => {
      if (prevSelectedKeys.includes(key)) {
        return prevSelectedKeys.filter((k) => k !== key);
      } else {
        return [...prevSelectedKeys, key];
      }
    });
  };

  const toggleDisplayType = (type) => {
    setDisplayType(type);
    setActiveButton(type);
  };

  const createCollectionTypes = async () => {
    for (const key of selectedKeys) {
      const cleanKey = key.replace(/_/g, ''); 
      const collectionName = cleanKey;
      const singularName = cleanKey;
      const pluralName = `${cleanKey}s`;
      const displayName = key ;
      const description = `${key} Taxonomy`;

      // Define the attributes for the collection type
      const attributes = {
        name: { type: "text" },
        slug: { type: "text" },
      };

      // Create the collection type
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
          attributes,
        },
      });

      if (status === 201) {
        toggleNotification({
          message: `${displayName} collection type created successfully`,
        });
      }
    }
  };

  return (
    <ModalLayout
      onClose={() => setShowModal(false)}
      labelledBy="title"
      as="form"
    >
      <ModalHeader>
        <Typography fontWeight="bold" textColor="neutral800" as="h2" id="title">
          {/* {displayType === "app" ? "App" : "Post"} */}
        </Typography>
        <div style={{ display: "flex" }}>
          <Button
            variant="tertiary"
            onClick={() => toggleDisplayType("app")}
            active={activeButton === "app"}
            style={{ marginRight: "10px" }}
          >
            App
          </Button>
          <Button
            variant="tertiary"
            onClick={() => toggleDisplayType("post")}
            active={activeButton === "post"}
            style={{ marginRight: "10px" }}
          >
            Post
          </Button>
          <Button
            variant="tertiary"
            onClick={() => toggleDisplayType("page")}
            active={activeButton === "page"}
            style={{ marginRight: "10px" }}
          >
            Page
          </Button>
          <Button
            variant="tertiary"
            onClick={() => toggleDisplayType("agency")}
            active={activeButton === "agency"}
            style={{ marginRight: "10px" }}
          >
            Agency
          </Button>
          <Button
            variant="tertiary"
            onClick={() => toggleDisplayType("attachment")}
            active={activeButton === "attachment"}
            style={{ marginRight: "10px" }}
          >
            Attachment
          </Button>
          <Button
            variant="tertiary"
            onClick={() => toggleDisplayType("services")}
            active={activeButton === "services"}
            style={{ marginRight: "10px" }}
          >
            Services
          </Button>
        </div>
      </ModalHeader>
      <ModalBody>
        <ul>
          {taxonomyKeys
            .filter((key) => key in taxonomyData[displayType])
            .map((key, index) => (
              <li key={index}>
                <label>
                  <input
                    type="checkbox"
                    checked={selectedKeys.includes(key)}
                    onChange={() => handleCheckboxChange(key)}
                  />
                  {key}
                </label>
              </li>
            ))}
        </ul>
      </ModalBody>
      <ModalFooter
        startActions={
          <Button variant="tertiary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
        }
        endActions={<Button onClick={createCollectionTypes}>Create Collection Types</Button>}
      />
    </ModalLayout>
  );
};

export default TaxonomyModal;

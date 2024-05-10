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
  const [displayType, setDisplayType] = useState("taxonomies"); // Default to displaying taxonomies

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

        // Merge keys from both postTypes and taxonomies
        const allKeysSet = new Set([
          ...Object.keys(filterDataTypes.taxonomies),
          ...Object.keys(filterDataTypes.postTypes),
        ]);

        // Convert the Set back to an array
        const allKeys = [...allKeysSet];

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

  const toggleDisplayType = () => {
    setDisplayType((prevDisplayType) =>
      prevDisplayType === "post" ? "taxonomies" : "post"
    );
  };

  const createTaxonomyCollectionTypes = async () => {
    for (const key of selectedKeys) {
      const cleanKey = key.replace(/_/g, ''); 
      const collectionName = cleanKey;
      const singularName = cleanKey;
      const pluralName = `${cleanKey}s`;
      const displayName = key ;
      const description = `${key} Taxonomy`;

      // Define the attributes for the taxonomy collection type
      const attributes = {
        name: { type: "text" },
        slug: { type: "text" },
      };

      // Create the taxonomy collection type
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
          {displayType === "post" ? "post" : "app"}
        </Typography>
        <Button variant="tertiary" onClick={toggleDisplayType}>
          {displayType === "post" ? "Show Taxonomies" : "Show Post Types"}
        </Button>
      </ModalHeader>
      <ModalBody>
        <ul>
          {taxonomyKeys
            .filter((key) =>
              displayType === "taxonomies"
                ? key in taxonomyData.taxonomies
                : key in taxonomyData.postTypes
            )
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
        endActions={<Button onClick={createTaxonomyCollectionTypes}>Create Collection Types</Button>}
      />
    </ModalLayout>
  );
};

export default TaxonomyModal;

// @ts-nocheck
import React, { useState, useEffect } from "react";
import {
  ModalLayout,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Typography,
  Button,
  TextInput,
} from "@strapi/design-system";

export default function SiteModal({ setShowModal, addSite }) {
  const [url, setUrl] = useState("");
  const [isValidUrl, setIsValidUrl] = useState(true); 
  const [postTypes, setPostTypes] = useState(null);
  const [taxonomies, setTaxonomies] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState(null);
  const [connectionSuccessful, setConnectionSuccessful] = useState(false);
  const [dataExtracted, setDataExtracted] = useState(false);
  const [addedUrls, setAddedUrls] = useState([]);

  useEffect(() => {
    const fetchExistingUrls = async () => {
      try {
        const response = await fetch("/api/sites");
        if (!response.ok) {
          throw new Error("Failed to fetch existing URLs");
        }
        const data = await response.json();
        const urls = data.map((site) => site.wordpressWebsiteUrl);
        setAddedUrls(urls);
      } catch (error) {
        console.error("Error fetching existing URLs:", error);
      }
    };

    fetchExistingUrls();
  }, []);

  const fetchWordPressPostTypes = async () => {
    const endpoint = `${url}/wp-json/custom/v1/posts/post`;
    try {
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`Error fetching post types: ${response.statusText}`);
      }
      const data = await response.json();
      setPostTypes(data);
      console.log("Fetched post types:", data);
      return data;
    } catch (error) {
      console.error("Failed to fetch WordPress post types:", error);
    }
  };

  const fetchWordPressTaxonomies = async () => {
    const endpoint = `${url}/wp-json/custom/v1/posts/app`;
    try {
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`Error fetching taxonomies: ${response.statusText}`);
      }
      const data = await response.json();
      setTaxonomies(data);
      console.log("Fetched taxonomies:", data);
      return data;
    } catch (error) {
      console.error("Failed to fetch WordPress taxonomies:", error);
    }
  };

  const fetchWordPressData = async () => {
    try {
      const [fetchedPostTypes, fetchedTaxonomies] = await Promise.all([
        fetchWordPressPostTypes(),
        fetchWordPressTaxonomies(),
      ]);
      const transformedData = {
        wordpressWebsiteUrl: url,
        postTypes: fetchedPostTypes,
        taxonomies: fetchedTaxonomies,
        connectionSuccessful: connectionSuccessful,
        dataExtracted: dataExtracted,
      };
      submitDataToBackend(transformedData);
    } catch (error) {
      console.log(error);
    }
    setShowModal(false)
    window.location.reload();
  };

  const submitDataToBackend = async (transformedData) => {
    setIsSubmitting(true);
    setSubmissionError(null);
    try {
      if (!transformedData.postTypes || !transformedData.taxonomies) {
        throw new Error("Failed to fetch data. Post types or taxonomies are null.");
      }

      const response = await fetch("/api/sites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: transformedData }),
      });
      if (!response.ok) throw new Error("Failed to submit data");

      setIsSubmitting(false);
      setConnectionSuccessful(true);
      setDataExtracted(true);
      setAddedUrls([...addedUrls, url]);
    } catch (error) {
      setIsSubmitting(false);
      setSubmissionError(error.message);
      alert("Failed to fetch data. Please check your URL and try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsValidUrl(isValidHttpUrl(url));
    if (!isValidHttpUrl(url)) {
      return;
    }

    if (addedUrls.includes(url)) {
      alert("This URL is already added.");
      return;
    }

    fetchWordPressData();
  };

  const handleUrlChange = (e) => {
    const inputUrl = e.target.value;
    setUrl(inputUrl);
    setIsValidUrl(isValidHttpUrl(inputUrl));
  };

  const isValidHttpUrl = (url) => {
    let urlObj;
    try {
      urlObj = new URL(url);
    } catch (_) {
      return false;
    }

    return urlObj.protocol === "http:" || urlObj.protocol === "https:";
  };

  return (
    <ModalLayout
      onClose={() => setShowModal(false)}
      labelledBy="title"
      as="form"
      onSubmit={handleSubmit}
    >
      <ModalHeader>
        <Typography  fontWeight="bold" textColor="neutral800" as="h2" id="title">
          Add site
        </Typography>
      </ModalHeader>

      <ModalBody>
        <TextInput
          placeholder="Enter the URL to fetch data from the WordPress"
          label="URL"
          name="text"
          onChange={(e) => setUrl(e.target.value)}
          value={url}
          error={!isValidUrl && "Please enter a valid URL"}
        />
      </ModalBody>

      <ModalFooter
        startActions={
          <Button onClick={() => setShowModal(false)} variant="tertiary">
            Cancel
          </Button>
        }
        endActions={<Button type="submit" disabled={!isValidUrl} >Add site</Button>}
      />
    </ModalLayout>
  );
}

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
  const [post, setPost] = useState(null);
  const [app, setApp] = useState(null);
  const [page, setPage] = useState(null);
  const [attachment, setAttachment] = useState(null);
  const [agency, setAgency] = useState(null);
  const [services, setServices] = useState(null);
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

  const fetchWordPressPost = async () => {
    const endpoint = `${url}/wp-json/custom/v1/posts/post`;
    try {
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`Error fetching post: ${response.statusText}`);
      }
      const data = await response.json();
      setPost(data);
      console.log("Fetched post types:", data);
      return data;
    } catch (error) {
      console.error("Failed to fetch WordPress post :", error);
    }
  };

  const fetchWordPressApp = async () => {
    const endpoint = `${url}/wp-json/custom/v1/posts/app`;
    try {
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`Error fetching App: ${response.statusText}`);
      }
      const data = await response.json();
      setApp(data);
      console.log("Fetched taxonomies:", data);
      return data;
    } catch (error) {
      console.error("Failed to fetch WordPress App:", error);
    }
  };

  const fetchWordPressPage = async () => {
    const endpoint = `${url}/wp-json/custom/v1/posts/page`;
    try {
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`Error fetching Page: ${response.statusText}`);
      }
      const data = await response.json();
      setPage(data);
      console.log("Fetched page:", data);
      return data;
    } catch (error) {
      console.error("Failed to fetch WordPress Page:", error);
    }
  };

  const fetchWordPressAttachment = async () => {
    const endpoint = `${url}/wp-json/custom/v1/posts/attachment`;
    try {
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`Error fetching Attachment: ${response.statusText}`);
      }
      const data = await response.json();
      setAttachment(data);
      console.log("Fetched attachment:", data);
      return data;
    } catch (error) {
      console.error("Failed to fetch WordPress Attachment:", error);
    }
  };

  const fetchWordPressAgency = async () => {
    const endpoint = `${url}/wp-json/custom/v1/posts/agency`;
    try {
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`Error fetching Agency: ${response.statusText}`);
      }
      const data = await response.json();
      setAgency(data);
      console.log("Fetched taxonomies:", data);
      return data;
    } catch (error) {
      console.error("Failed to fetch WordPress App:", error);
    }
  };

  const fetchWordPressServices = async () => {
    const endpoint = `${url}/wp-json/custom/v1/posts/services`;
    try {
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`Error fetching Services: ${response.statusText}`);
      }
      const data = await response.json();
      setServices(data);
      console.log("Fetched services:", data);
      return data;
    } catch (error) {
      console.error("Failed to fetch WordPress Services:", error);
    }
  };

  const fetchWordPressData = async () => {
    try {
      const [fetchedPost, fetchedApp, fetchedPage, fetchedAgency, fetchedAttachment, fetchedServices] = await Promise.all([
        fetchWordPressPost(),
        fetchWordPressApp(),
        fetchWordPressPage(),
        fetchWordPressAgency(),
        fetchWordPressAttachment(),
        fetchWordPressServices()
      ]);
      const transformedData = {
        wordpressWebsiteUrl: url,
        post: fetchedPost,
        app: fetchedApp,
        page: fetchedPage,
        agency: fetchedAgency,
        attachment: fetchedAttachment,
        services: fetchedServices,
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
      if (!transformedData.post || !transformedData.app) {
        throw new Error("Failed to fetch data. Post, App are null.");
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

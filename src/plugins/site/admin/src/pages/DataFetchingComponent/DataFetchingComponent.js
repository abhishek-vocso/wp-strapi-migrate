// @ts-nocheck
import React, { memo, useEffect, useState } from "react";
import { BaseHeaderLayout, ContentLayout } from "@strapi/design-system/Layout";
import { Box } from "@strapi/design-system/Box";
import { Button } from "@strapi/design-system/Button";
import { useParams, useHistory } from "react-router-dom";
import Modal from "./Modal";
import { useQueryParams } from "@strapi/helper-plugin";
import TaxonomyModal from "./taxonomyModal";

const HomePage = () => {
  const [siteData, setSiteData] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [showTaxonomyModal, setShowTaxonomyModal] = useState(false); 
  const siteId = useParams().id;
  const history = useHistory();
  const [{ query }, setQuery] = useQueryParams();

  useEffect(() => {
    async function fetchSiteData() {
      try {
        const response = await fetch(`/api/sites/${siteId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch site data");
        }
        const data = await response.json();
        setSiteData(data);
      } catch (error) {
        console.error("Error fetching site data:", error);
      }
    }

    fetchSiteData();
  }, [siteId]);

  const handleGoBack = () => {
    history.goBack();
  };

  return (
    <>
      <ContentLayout>
        <Box>
          <Button onClick={handleGoBack} variant="secondary">
            Go Back
          </Button>
        </Box>
      </ContentLayout>

      <BaseHeaderLayout
        title={siteData?.data?.attributes?.wordpressWebsiteUrl || "Loading..."}
        as="h2"
      />
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <BaseHeaderLayout
            title="WordPress Data"
            as="h1"
            style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "0.5rem",
            }}
          >
            <input
              type="checkbox"
              style={{
                width: "20px",
                height: "20px",
                marginRight: "10px",
                cursor: "pointer",
                marginLeft: "20px",
              }}
              onChange={(e) => {
                if (e.target.checked) {
                  setShowModal(true);
                } else {
                  setShowModal(false);
                }
              }}
            />
            <BaseHeaderLayout
              title="Create Collection Type"
              as="h1"
              style={{ fontSize: "2.0rem", marginBottom: "0.5rem" }}
            />
            <input
              type="checkbox"
              style={{
                width: "20px",
                height: "20px",
                marginRight: "10px",
                cursor: "pointer",
                marginLeft: "20px",
              }}
              onChange={(e) => {
                if (e.target.checked) {
                  setShowTaxonomyModal(true);
                } else {
                  setShowTaxonomyModal(false);
                }
              }}
            />
            <BaseHeaderLayout
              title="Create taxonomy"
              as="h1"
              style={{ fontSize: "2.0rem", marginBottom: "0.5rem" }}
            />
          </div>
        </div>
        <div>
          {showModal && <Modal setShowModal={setShowModal} />}
          {showTaxonomyModal && <TaxonomyModal setShowModal={setShowTaxonomyModal} />}
        </div>
      </div>
    </>
  );
};

export default memo(HomePage);

import React from "react";
import { Row, Col } from "antd";
import ProductCard from "./ProductCard";

const ProductCardExample = () => {
  const products = [
    {
      id: 1,
      title: "Layanan Keuangan 1",
      description:
        "Deskripsi layanan keuangan pertama yang memberikan solusi terbaik untuk kebutuhan finansial Anda.",
      image: "https://via.placeholder.com/400x200", // Contoh URL gambar
    },
    {
      id: 2,
      title: "Layanan Keuangan 2",
      description:
        "Deskripsi layanan keuangan kedua dengan fitur-fitur unggulan dan pelayanan terpercaya.",
      image: "https://via.placeholder.com/400x200",
    },
    {
      id: 3,
      title: "Layanan Keuangan 3",
      description:
        "Deskripsi layanan keuangan ketiga yang inovatif dan sesuai dengan perkembangan zaman.",
      image: "https://via.placeholder.com/400x200",
    },
  ];

  const handleDetail = (productId) => {
    console.log("Detail clicked for product:", productId);
    // Handle navigation to detail page
  };

  return (
    <div style={{ padding: "24px" }}>
      <Row gutter={[24, 24]}>
        {products.map((product) => (
          <Col
            key={product.id}
            xs={24} // 1 kolom pada mobile
            sm={24} // 1 kolom pada tablet kecil
            md={12} // 2 kolom pada tablet
            lg={8} // 3 kolom pada desktop
            xl={8} // 3 kolom pada desktop besar
            xxl={8} // 3 kolom pada desktop sangat besar
          >
            <ProductCard
              title={product.title}
              description={product.description}
              image={product.image}
              onDetail={() => handleDetail(product.id)}
            />
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default ProductCardExample;

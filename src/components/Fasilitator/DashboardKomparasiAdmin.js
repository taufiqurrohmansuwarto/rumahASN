import { compareEmployeesSimasterSiasn } from '@/services/master.services';
import { useQuery } from '@tanstack/react-query'
import React from 'react'
import ReactJson from '../ReactJson';
import { PageContainer } from '@ant-design/pro-layout';
import Head from 'next/head';
import { Breadcrumb } from 'antd';
import Link from 'next/link';
import { comparePegawaiAdmin } from '@/services/admin.services';

function DashboardKomparasiAdmin() {
  const { data, isLoading } = useQuery(
    ["dashboard-compare-siasn-admin"],
    () => comparePegawaiAdmin()
  );
  
  return <div>{data && <ReactJson src={data} />}</div>;
}

export default DashboardKomparasiAdmin;

/* eslint-disable prefer-const */
import { faker } from '@faker-js/faker';
// @mui
import { Auth, DataStore } from 'aws-amplify';
import { useEffect, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { Grid, Container, Typography } from '@mui/material';
import { Users } from '../models';
// components
import Page from '../components/Page';
import Iconify from '../components/Iconify';
// sections
import {
  AppTasks,
  AppNewsUpdate,
  AppOrderTimeline,
  AppCurrentVisits,
  AppWebsiteVisits,
  AppTrafficBySite,
  AppWidgetSummary,
  AppCurrentSubject,
  AppConversionRates,
} from '../sections/@dashboard/app';

// ----------------------------------------------------------------------

export default function DashboardApp() {
  const theme = useTheme();
  const [userList, setUserList] = useState([]);
  const [bannedUser, setBannedUser] = useState([]);
  const [empStates, setEmpStates] = useState([]);
  const [verifiedUser, setVerifiedUser] = useState([]);
  const name = Auth.user?.attributes.email.split('@')[0];
  const getUsers = async () => {
    const models = await DataStore.query(Users);
    const bannedUser = models.filter((User) => User.status === 'BANNED');
    const vfUser = models.filter((User) => User.verified);
    let eStats = [];
    let companies = [];

    models.forEach((user) => {
      const comp = user.company;
      const isPresent = companies.find((c) => c === comp);
      if (!isPresent) {
        companies.push(comp);
      }
    });
    companies.forEach((company) => {
      const totalEmp = models.filter((user) => user.company === company);
      const consData = { label: company, value: totalEmp.length ?? 0 };
      eStats.push(consData);
    });
    console.log('companies: ', companies, eStats);
    setEmpStates(eStats);
    setUserList(models);
    setVerifiedUser(vfUser);
    setBannedUser(bannedUser);
  };
  useEffect(() => {
    getUsers();
    const subscription = DataStore.observe(Users).subscribe(() => {
      getUsers();
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <Page title="Dashboard">
      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ mb: 5 }}>
          Hi {name}, Welcome back!
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary title="Total Users" total={userList.length} icon={'fa-solid:user-friends'} />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary
              title="Verified Users"
              total={verifiedUser.length}
              color="info"
              icon={'arcticons:okta-verify'}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary
              title="Active Users"
              total={userList.length - bannedUser.length}
              color="warning"
              icon={'fontisto:radio-btn-active'}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary title="Banned Users" total={bannedUser.length} color="error" icon={'fa:ban'} />
          </Grid>

          <Grid item xs={12} md={6} lg={8}>
            <AppConversionRates title="Emplyee Stats" subheader="Company/Number" chartData={empStates} />
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <AppCurrentVisits
              title="Company Ratio"
              chartData={empStates}
              chartColors={[
                theme.palette.primary.main,
                theme.palette.chart.blue[0],
                theme.palette.chart.violet[0],
                theme.palette.chart.yellow[0],
              ]}
            />
          </Grid>
        </Grid>
      </Container>
    </Page>
  );
}

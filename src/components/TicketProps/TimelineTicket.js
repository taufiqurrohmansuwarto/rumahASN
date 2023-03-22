
import {
  formatDateFromNow,
} from "@/utils/client-utils";
import {LockOutlined, EditOutlined, AuditOutlined, UserSwitchOutlined} from '@ant-design/icons';
import {Avatar, Timeline, Typography, Space} from 'antd'

const Icons = ({ status }) => {
    if(status === 'edited'){
        return <EditOutlined/>
    } else if (status === 'status_changed'){
      return <AuditOutlined />
    } else if (status === 'change_agent'){
      return <UserSwitchOutlined />
    }
     else {
        return <LockOutlined/>
    }
}


const TimelineTicket = ({timelineItems}) => {

  return (
    <div style={{ marginTop: 10}}>
    {timelineItems?.length > 0 && (
            <Timeline>
              {timelineItems?.map((timeline) => (
                <Timeline.Item dot={<Icons status={timeline?.status} />} key={timeline.custom_id}>
                  <Space>
                    <Avatar size="small" src={timeline?.user?.image} />
                    <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                      {timeline?.user?.username} {timeline?.comment}{" "}
                      {formatDateFromNow(timeline?.created_at)}
                    </Typography.Text>
                  </Space>
                </Timeline.Item>
              ))}
            </Timeline>
          )}
    </div>
  )
}

export default TimelineTicket;
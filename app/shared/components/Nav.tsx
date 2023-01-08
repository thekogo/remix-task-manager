import { useLocation, useParams } from "@remix-run/react";
import { Navbar } from "flowbite-react";
import logo from "~/images/logo.jpg";


export default function Nav() {
  const { groupId } = useParams();
  const { pathname } = useLocation();

  return (
    <Navbar
      fluid={true}
      rounded={true}
      className="container mx-auto"
    >
      <Navbar.Brand href="/group">
        <img
          src={logo}
          className="mr-3 h-6 sm:h-9 rounded-md"
          alt="PEA Task Manager"
          />
        <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
          PEA Task Manager
        </span>
      </Navbar.Brand>
      <Navbar.Toggle />
      <Navbar.Collapse>
        <Navbar.Link
          href={`/group`}
          active={pathname === "/group"}
        >
          หน้าแรก
        </Navbar.Link>
        {groupId && 
          <>
            <Navbar.Link 
              href={`/group/${groupId}`}
              active={pathname.match("/group/[0-9]+$") !== null}
            >
              สมาชิกกลุ่ม
            </Navbar.Link>
            <Navbar.Link 
              href={`/group/${groupId}/task`}
              active={pathname.endsWith("/task")}
            >
              จัดการงาน
            </Navbar.Link>
            <Navbar.Link 
              href={`/group/${groupId}/list-task`}
              active={pathname.endsWith("/list-task")}
            >
              รายการงาน
            </Navbar.Link>
            </>
      }
      </Navbar.Collapse>
    </Navbar>
  )
}

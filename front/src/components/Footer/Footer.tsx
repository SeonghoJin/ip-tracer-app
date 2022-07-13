import {
  EventHandler,
  FC,
  MouseEventHandler,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import styled from "styled-components";
import GithubIcon from "../../static/images/GitHub-Mark-Light-32px.png";
import { useEmailService } from "../../hooks/useEmailService";
import { Group } from "../Styled";
import { Modal } from "../Modal/Modal";
import style from './Footer.module.scss';

function Footer(){
  const [opinionModalFlag, setOpinionModalFlag] = useState<boolean>(false);
  const { sendEmail } = useEmailService();

  const onToggleOpinionModal: MouseEventHandler = useCallback(() => {
    setOpinionModalFlag((prev) => !prev);
  }, []);

  const onSuccess = useCallback(async (value) => {
    setOpinionModalFlag((prev) => !prev);
    if (value !== "") {
      await sendEmail(value);
    }
  }, []);

  return (
    <FooterView
      onToggleOpinionModal={onToggleOpinionModal}
      opinionModalFlag={opinionModalFlag}
      onSuccess={onSuccess}
    />
  );
}

export default Footer;

type FooterViewProps = {
  onToggleOpinionModal: EventHandler<any>;
  opinionModalFlag: boolean;
  onSuccess: (value: string) => void;
};

const Button = styled.button`
  color: white;
  font-size: 14px;
`;

const OpinionTextArea = styled.textarea`
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding: 20px;
  font-size: 14px;
  border: 0;
  font-weight: bold;
`;

export const FooterView: FC<FooterViewProps> = ({
  onToggleOpinionModal,
  opinionModalFlag,
  onSuccess,
}) => {
  const ref = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  return (
    <div className={style.FooterWrapper}>
      <Group>
        <Button onClick={onToggleOpinionModal}>의견 보내기</Button>
      </Group>
      <Modal
        active={opinionModalFlag}
        header={"의견 보내기"}
        onSuccess={() => {
          onSuccess(ref.current?.value || "");
        }}
        onClose={onToggleOpinionModal}
      >
        <OpinionTextArea ref={ref} />
      </Modal>
      <Group>
        <a href={"https://github.com/SeonghoJin"} target={"_blank"}>
          <img src={GithubIcon} />
        </a>
      </Group>
    </div>
  );
};

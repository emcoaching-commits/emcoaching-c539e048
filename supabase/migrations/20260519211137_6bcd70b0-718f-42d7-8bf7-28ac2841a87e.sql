INSERT INTO public.site_settings (key, value) VALUES
  ('welcome_popup_enabled', 'true'),
  ('welcome_popup_title', 'Bienvenue sur EM'' Coaching !'),
  ('welcome_popup_content', 'Merci de visiter le site ! Sache qu''il est encore en cours de développement : certaines pages peuvent évoluer et tout n''est pas encore parfait au pixel près. En revanche, les fonctionnalités essentielles (création de compte, prise de rendez-vous, espace client, paiements, messagerie avec Emma) sont opérationnelles et le site est entièrement sécurisé (authentification protégée, données chiffrées, accès strictement personnels). N''hésite pas à explorer, prendre tes premiers rendez-vous et à signaler tout petit souci à Emma. Bonne visite et bon coaching !'),
  ('welcome_popup_version', '1')
ON CONFLICT (key) DO NOTHING;